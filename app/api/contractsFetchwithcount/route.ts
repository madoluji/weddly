import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import Contract from "@/models/contract";
import mongoose from "mongoose";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

const CONTRACT_COUNTS_CACHE_TTL_MS = 60 * 1000;
const ENABLE_CONTRACT_COUNTS_BENCHMARK =
  process.env.NODE_ENV !== "production" &&
  process.env.ENABLE_API_BENCHMARK_LOGS === "true";

export async function GET(req: NextRequest) {
  const requestStartTime = Date.now();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // Get userId from query parameters

  // Check if user is authenticated
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Validate userId
  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  if (!mongoose.isValidObjectId(userId)) {
    return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && session.user.id !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const cacheKey = `contracts-count:${userId}`;
  const cached = getCacheValue<{ activeCount: number; completeCount: number }>(
    cacheKey
  );
  if (cached) {
    if (ENABLE_CONTRACT_COUNTS_BENCHMARK) {
      console.log(
        `[contractsFetchwithcount] cache=HIT userId=${userId} durationMs=${
          Date.now() - requestStartTime
        }`
      );
    }
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    await connectMongoDB(); // Connect to MongoDB

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dbStartTime = Date.now();
    const [aggregationResult] = await Contract.aggregate<{
      activeContracts: Array<{ count: number }>;
      completedContracts: Array<{ count: number }>;
    }>([
      {
        $match: {
          $or: [{ clientId: userObjectId }, { freelancerId: userObjectId }],
        },
      },
      {
        // Keep only fields needed by count facets.
        $project: {
          status: 1,
        },
      },
      {
        $facet: {
          activeContracts: [
            { $match: { status: "active" } },
            { $count: "count" },
          ],
          completedContracts: [
            { $match: { status: "completed" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const activeCount = aggregationResult?.activeContracts?.[0]?.count ?? 0;
    const completeCount = aggregationResult?.completedContracts?.[0]?.count ?? 0;
    const payload = { activeCount, completeCount };

    setCacheValue(cacheKey, payload, CONTRACT_COUNTS_CACHE_TTL_MS);

    if (ENABLE_CONTRACT_COUNTS_BENCHMARK) {
      const totalDurationMs = Date.now() - requestStartTime;
      const dbDurationMs = Date.now() - dbStartTime;
      console.log(
        `[contractsFetchwithcount] cache=MISS userId=${userId} dbMs=${dbDurationMs} totalMs=${totalDurationMs} activeCount=${activeCount} completeCount=${completeCount}`
      );
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=30",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching contract data:", error);
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
