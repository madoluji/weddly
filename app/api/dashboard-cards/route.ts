import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";
import User from "@/models/user";
import Review from "@/models/projectindividualreview";
import Contract from "@/models/contract";
import Payment from "@/models/payment";
import ClientInfo from "@/models/clientinfo";
import FreelancerInfo from "@/models/freelancerInfo";

const DASHBOARD_CARDS_TTL_MS = 60 * 1000;

type DashboardCardsPayload = {
  profile: {
    name: string;
    lastName: string;
    profilePicture: string | null;
  };
  counts: {
    activeCount: number;
    completeCount: number;
  };
  finances: {
    totalFreelancerAmount: number;
    totalClientAmount: number;
    totalSpent: number;
    pendingBalance: number;
  };
  ratings: {
    client: number;
    freelancer: number;
  };
  recentReviews: Array<{
    reviewerId: {
      name: string;
      lastName: string;
      profilePicture?: string;
    };
    comment: string;
    rating: number;
    createdAt?: string;
  }>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `dashboard-cards:${userId}`;
    const cached = getCacheValue<DashboardCardsPayload>(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
          "X-Cache": "HIT",
        },
      });
    }

    await connectMongoDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [
      user,
      latestReviews,
      contractCountsResult,
      paymentSummaryResult,
      clientInfo,
      freelancerInfo,
    ] = await Promise.all([
      User.findById(userId)
        .select("name lastName profilePicture")
        .lean<{
          name?: string;
          lastName?: string;
          profilePicture?: string;
        } | null>(),
      Review.find({ revieweeId: userId })
        .sort({ createdAt: -1 })
        .select("rating comment createdAt reviewerId")
        .limit(4)
        .populate("reviewerId", "name lastName profilePicture")
        .lean<
          Array<{
            reviewerId?: {
              name?: string;
              lastName?: string;
              profilePicture?: string;
            };
            comment?: string;
            rating?: number;
            createdAt?: Date | string;
          }>
        >(),
      Contract.aggregate<{
        activeContracts: Array<{ count: number }>;
        completedContracts: Array<{ count: number }>;
      }>([
        {
          $match: {
            $or: [{ clientId: userObjectId }, { freelancerId: userObjectId }],
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
      ]),
      Payment.aggregate<{
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
      ]),
      ClientInfo.findOne({ userId })
        .select("rating")
        .lean<{ rating?: number } | null>(),
      FreelancerInfo.findOne({ userId })
        .select("rating")
        .lean<{ rating?: number } | null>(),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const contractCounts = contractCountsResult[0];
    const paymentSummary = paymentSummaryResult[0];

    const payload: DashboardCardsPayload = {
      profile: {
        name: user.name || "",
        lastName: user.lastName || "",
        profilePicture: user.profilePicture || null,
      },
      counts: {
        activeCount: contractCounts?.activeContracts?.[0]?.count ?? 0,
        completeCount: contractCounts?.completedContracts?.[0]?.count ?? 0,
      },
      finances: {
        totalFreelancerAmount: paymentSummary?.incomeFacet?.[0]?.total ?? 0,
        totalClientAmount: paymentSummary?.expenseFacet?.[0]?.total ?? 0,
        totalSpent: paymentSummary?.totalSpentFacet?.[0]?.total ?? 0,
        pendingBalance: paymentSummary?.pendingBalanceFacet?.[0]?.total ?? 0,
      },
      ratings: {
        client: clientInfo?.rating ?? 0,
        freelancer: freelancerInfo?.rating ?? 0,
      },
      recentReviews: latestReviews.map((review) => ({
        reviewerId: {
          name: review.reviewerId?.name || "Anonymous",
          lastName: review.reviewerId?.lastName || "",
          profilePicture: review.reviewerId?.profilePicture,
        },
        comment: review.comment || "",
        rating: review.rating ?? 0,
        createdAt:
          review.createdAt instanceof Date
            ? review.createdAt.toISOString()
            : review.createdAt,
      })),
    };

    setCacheValue(cacheKey, payload, DASHBOARD_CARDS_TTL_MS);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard cards:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
