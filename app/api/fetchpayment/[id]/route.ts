import { NextRequest, NextResponse } from "next/server";
import mongoose, { PipelineStage } from "mongoose";
import { connectMongoDB } from "@/app/lib/mongodb";
import Payment from "@/models/payment";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

type AuthUser = {
  id?: string;
  role?: string;
};

const PAYMENT_CACHE_TTL_MS = 60 * 1000;
const GATEWAY_SYNC_TIMEOUT_MS = 800;

function parseAuthUser(req: NextRequest): AuthUser | null {
  try {
    const raw = req.headers.get("user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function triggerGatewaySync(userId: string): Promise<void> {
  const syncUrl = process.env.PAYMENT_GATEWAY_SYNC_URL;
  if (!syncUrl) {
    return;
  }

  const syncToken = process.env.PAYMENT_GATEWAY_SYNC_TOKEN;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GATEWAY_SYNC_TIMEOUT_MS);

  try {
    await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(syncToken ? { "x-sync-token": syncToken } : {}),
      },
      body: JSON.stringify({ userId }),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    console.warn("Payment gateway sync failed or timed out:", error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const { searchParams } = new URL(req.url);
  const allTransaction = searchParams.get("alltransaction") === "true";
  const refresh = searchParams.get("refresh") === "true";

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  if (!mongoose.isValidObjectId(userId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  const authUser = parseAuthUser(req);
  if (!authUser?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = authUser.role === "admin" || authUser.role === "superadmin";
  if (!isAdmin && authUser.id !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (refresh) {
    // Fire-and-forget sync so slow gateways never block the API response path.
    void triggerGatewaySync(userId);
  }

  const cacheKey = `fetchpayment:${userId}:${allTransaction ? "all" : "summary"}`;
  const cached = getCacheValue<Record<string, unknown>>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    await connectMongoDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const transactionListFacet = (allTransaction
      ? [
          {
            $addFields: {
              type: {
                $cond: [
                  { $eq: ["$clientId", userObjectId] },
                  "expense",
                  "income",
                ],
              },
            },
          },
          {
            $match: {
              $or: [{ type: "expense" }, { type: "income", status: "completed" }],
            },
          },
          { $sort: { createdAt: -1 as const } },
          {
            $lookup: {
              from: "jobs",
              localField: "jobId",
              foreignField: "_id",
              pipeline: [{ $project: { title: 1 } }],
              as: "jobLookup",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "freelancerId",
              foreignField: "_id",
              pipeline: [{ $project: { name: 1, lastName: 1 } }],
              as: "freelancerLookup",
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "clientId",
              foreignField: "_id",
              pipeline: [{ $project: { name: 1, lastName: 1 } }],
              as: "clientLookup",
            },
          },
          {
            $project: {
              _id: 1,
              contractId: 1,
              transactionId: 1,
              status: 1,
              createdAt: 1,
              method: 1,
              provider: "$method",
              date: "$createdAt",
              type: 1,
              totalAmount: 1,
              freelancerAmount: 1,
              amount: {
                $cond: [
                  { $eq: ["$type", "income"] },
                  "$freelancerAmount",
                  "$totalAmount",
                ],
              },
              // Keep response shape compatible for current UI usage.
              jobId: { $ifNull: [{ $first: "$jobLookup" }, null] },
              freelancerId: { $ifNull: [{ $first: "$freelancerLookup" }, null] },
              clientId: { $ifNull: [{ $first: "$clientLookup" }, null] },
            },
          },
        ]
      : [{ $match: { _id: { $exists: false } } }]) as PipelineStage.FacetPipelineStage[];

    const [result] = await Payment.aggregate<{
      transactionList: Array<Record<string, unknown>>;
      totalSpentFacet: Array<{ total: number }>;
      pendingBalanceFacet: Array<{ total: number }>;
      incomeFacet: Array<{ total: number }>;
      expenseFacet: Array<{ total: number }>;
    }>([
      {
        $match: {
          $or: [{ freelancerId: userObjectId }, { clientId: userObjectId }],
        },
      },
      {
        $facet: {
          transactionList: transactionListFacet,
          totalSpentFacet: [
            { $match: { clientId: userObjectId, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
          pendingBalanceFacet: [
            { $match: { status: { $ne: "completed" } } },
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $cond: [
                      { $eq: ["$clientId", userObjectId] },
                      "$totalAmount",
                      "$freelancerAmount",
                    ],
                  },
                },
              },
            },
          ],
          incomeFacet: [
            { $match: { freelancerId: userObjectId, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$freelancerAmount" } } },
          ],
          expenseFacet: [
            { $match: { clientId: userObjectId, status: "completed" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
          ],
        },
      },
    ]);

    const totalSpent = result?.totalSpentFacet?.[0]?.total ?? 0;
    const pendingBalance = result?.pendingBalanceFacet?.[0]?.total ?? 0;
    const totalFreelancerAmount = result?.incomeFacet?.[0]?.total ?? 0;
    const totalClientAmount = result?.expenseFacet?.[0]?.total ?? 0;
    const transactionsWithType = result?.transactionList ?? [];

    const payload = allTransaction
      ? {
          transactionList: transactionsWithType,
          transactionsWithType,
          totalSpent,
          pendingBalance,
          totalFreelancerAmount,
          totalClientAmount,
        }
      : {
          totalFreelancerAmount,
          totalClientAmount,
          totalSpent,
          pendingBalance,
        };

    setCacheValue(cacheKey, payload, PAYMENT_CACHE_TTL_MS);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);

    // Last-resort cached fallback on runtime failures.
    const staleCached = getCacheValue<Record<string, unknown>>(cacheKey);
    if (staleCached) {
      return NextResponse.json(staleCached, {
        status: 200,
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
          "X-Cache": "STALE",
        },
      });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { message: `Method ${req.method} Not Allowed` },
    { status: 405 }
  );
}
