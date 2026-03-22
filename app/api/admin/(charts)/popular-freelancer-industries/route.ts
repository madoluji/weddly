import { connectMongoDB } from "@/app/lib/mongodb";
import ClientInfo from "@/models/clientinfo";
import FreelancerInfo from "@/models/freelancerInfo";
import { NextRequest, NextResponse } from "next/server";

type IndustryInsightsResponse = {
    industry: string;
    freelancerCount: number;
}[];

export async function GET(
    req: NextRequest,
    res: NextResponse<IndustryInsightsResponse | { error: string }>
) {
    await connectMongoDB();

    try {
        // ✅ Aggregate industry data from ClientInfo collection
        const industryStats = await FreelancerInfo.aggregate([
            { $unwind: "$industry" }, // ✅ Unwind industry array to count each industry separately
            {
                $group: {
                    _id: "$industries",  // Group by industry field
                    freelancerCount: { $sum: 1 }  // Count clients per industry
                }
            },
            { $sort: { clientCount: -1 } }, // Sort by most popular industries
            { $limit: 10 } // ✅ (Optional) Limit to top 10 industries for bar graph
        ]);

        // ✅ Format the response to match charting requirements
        const formattedData = industryStats.map(data => ({
            industry: data._id,
            freelancerCount: data.clientCount
        }));

        return NextResponse.json(formattedData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching industry data" }, { status: 500 });
    }
}
