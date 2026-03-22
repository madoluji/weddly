"use server";

import { connectMongoDB } from "@/app/lib/mongodb";
import Payment from "@/models/payment";
import User from "@/models/user"; // Assuming you have a User model
import { NextRequest, NextResponse } from "next/server";

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

        const topSpenders = await Payment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$clientId",
                    totalSpent: { $sum: "$totalAmount" }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 8 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "client"
                }
            },
            {
                $unwind: "$client"
            },
            {
                $project: {
                    _id: 1,
                    totalSpent: 1,
                    "client.name": 1,
                    "client.lastName": 1
                }
            }
        ]);

        const topEarners = await Payment.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$freelancerId",
                    totalEarned: { $sum: "$freelancerAmount" }
                }
            },
            { $sort: { totalEarned: -1 } },
            { $limit: 8 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "freelancer"
                }
            },
            {
                $unwind: "$freelancer"
            },
            {
                $project: {
                    _id: 1,
                    totalEarned: 1,
                    "freelancer.name": 1,
                    "freelancer.lastName": 1
                }
            }
        ]);

        return NextResponse.json({ success: true, data: { topSpenders, topEarners } });
    } catch (error) {
        console.error("Error fetching financial statistics:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}