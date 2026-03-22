"use server";

import { NextRequest, NextResponse } from "next/server";

import Payment from "@/models/payment";
import { connectMongoDB } from "@/app/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "month"; // Default to month-wise aggregation
        let groupBy;
        if (type === "day") {
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        } else if (type === "month") {
            groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        } else if (type === "year") {
            groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
        } else {
            return NextResponse.json({ success: false, message: "Invalid type parameter" }, { status: 400 });
        }

        const financialStats = await Payment.aggregate([
            { $match: { status: "completed" } }, // Only include completed transactions
            {
                $group: {
                    _id: groupBy,
                    turnOver: { $sum: "$totalAmount" },
                    freelancerEarnings: { $sum: "$freelancerAmount" },
                    platformRevenue: { $sum: "$platformFee" },
                    completedTransactions: { $sum: 1 },
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return NextResponse.json({ success: true, data: financialStats, type: type });
    } catch (error) {
        console.error("Error fetching financial statistics:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}