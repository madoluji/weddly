import { connectMongoDB } from "@/app/lib/mongodb";
import Payment from "@/models/payment";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "month"; // Default to month-wise aggregation

        let dateFilter = {};
        const now = new Date();

        if (type === "day") {
            dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        } else if (type === "month") {
            dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
        } else if (type === "year") {
            dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
        }

        const paymentMethodsStats = await Payment.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: { method: "$method", date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Format the data so that it's easier to plot as multiple lines
        const formattedData = paymentMethodsStats.reduce((acc, item) => {
            const { method, date } = item._id;
            const count = item.count;

            if (!acc[date]) acc[date] = {};

            acc[date][method] = count;

            return acc;
        }, {});

        const dates = Object.keys(formattedData).sort();
        const len = dates.length;

        // Get all unique payment methods
        const allMethods = new Set<string>();
        paymentMethodsStats.forEach(item => allMethods.add(item._id.method));

        // Calculate percentage change for all methods
        const percentageChange = dates.slice(-2).reduce((acc: { [key: string]: { date: string, percentageChange: number }[] }, date, index, array) => {
            if (index > 0) {
                const prevDate = array[index - 1];
                const currentData = formattedData[date];
                const prevData = formattedData[prevDate];

                // Iterate over all payment methods
                allMethods.forEach(method => {
                    const currentCount = currentData[method] || 0;
                    const prevCount = prevData[method] || 0;

                    // Calculate percentage change
                    let percentageChangeValue = 0;
                    if (prevCount === 0) {
                        percentageChangeValue = 100; // Infinite growth if previous count is 0
                    } else {
                        percentageChangeValue = ((currentCount - prevCount) / prevCount) * 100;
                    }

                    if (!acc[method]) acc[method] = [];
                    acc[method].push({ date, percentageChange: parseFloat(percentageChangeValue.toFixed(2)) }); // Round to 2 decimal places
                });
            }
            return acc;
        }, {});

        return NextResponse.json({ success: true, data: { paymentMethodsStats: formattedData, percentageChange } });
    } catch (error) {
        console.error("Error fetching financial statistics:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}