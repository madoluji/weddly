import { connectMongoDB } from "@/app/lib/mongodb";
import ClientInfo from "@/models/clientinfo";
import FreelancerInfo from "@/models/freelancerInfo";
import { NextRequest, NextResponse } from "next/server";

type IndustryInsightsResponse = {
    industry: string;
    count: number;
}[];

export async function GET(
    req: NextRequest,
    res: NextResponse<IndustryInsightsResponse | { error: string }>
) {
    await connectMongoDB();

    try {
        const { searchParams } = new URL(req.url);

        // ✅ Get `accountType` from query params (default to client)
        const accountType = searchParams.get("accountType") || "freelancer";

        let industryStats;

        // ✅ Fetch industries based on `accountType`
        if (accountType === "freelancer") {
            industryStats = await FreelancerInfo.aggregate([
                { $unwind: "$industries" }, // ✅ Unwind industries array for counting
                {
                    $group: {
                        _id: "$industries", // Group by industry field
                        count: { $sum: 1 } // Count freelancers per industry
                    }
                },
                { $sort: { count: -1 } }, // Sort by most popular industries
                { $limit: 10 } // ✅ Limit to top 10 industries
            ]);
        } else {
            // Default: Fetch client industry data
            industryStats = await ClientInfo.aggregate([
                { $unwind: "$industry" }, // ✅ Unwind industry array for counting
                {
                    $group: {
                        _id: "$industry", // Group by industry field
                        count: { $sum: 1 } // Count clients per industry
                    }
                },
                { $sort: { count: -1 } }, // Sort by most popular industries
                { $limit: 10 } // ✅ Limit to top 10 industries
            ]);
        }

        // ✅ Format the response for charting
        const formattedData = industryStats.map(data => ({
            industry: data._id,
            count: data.count
        }));

        return NextResponse.json(formattedData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching industry data" }, { status: 500 });
    }
}
