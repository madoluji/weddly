import { connectMongoDB } from "@/app/lib/mongodb";
import Jobs from "@/models/jobs";
import Proposal from "@/models/proposal";
import { NextRequest, NextResponse } from "next/server";

type TransitionInsightsResponse = {
    date: string;
    activeJobs: number;
    inProgressJobs: number;
    completedJobs: number;
    canceledJobs: number;
    submitedProposals: number;
    acceptedProposals: number;
}[];

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export async function GET(
    req: NextRequest,
    res: NextResponse<TransitionInsightsResponse | { error: string }>
) {
    await connectMongoDB();

    try {

        const { searchParams } = new URL(req.url)
        // Get timeframe from query params (default: "monthly")
        const timeframe = searchParams.get("timeframe") || "monthly";

        let groupBy: any = {};
        let dateFormatter: (d: any) => string;

        if (timeframe === "daily") {
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$statusHistory.changedAt" } };
            dateFormatter = (d: any) => d._id;
        } else if (timeframe === "yearly") {
            groupBy = { $year: "$statusHistory.changedAt" };
            dateFormatter = (d: any) => `Year ${d._id}`;
        } else {
            groupBy = { $month: "$statusHistory.changedAt" };
            dateFormatter = (d: any) => monthNames[d._id - 1];
        }


        const totalActiveJobs = await Jobs.countDocuments({ "statusHistory.status": "active" });
        const totalInProgressJobs = await Jobs.countDocuments({ "statusHistory.status": "in-progress" });
        const totalCompletedJobs = await Jobs.countDocuments({ "statusHistory.status": "completed" });
        const totalPendingProposals = await Proposal.countDocuments({ "statusHistory.status": "pending" });


        // ✅ Track job status transitions
        const jobsTransitions = await Jobs.aggregate([
            { $unwind: "$statusHistory" },
            {
                $group: {
                    _id: groupBy,
                    activeJobs: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "active"] }, 1, 0] } },
                    inProgressJobs: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "in-progress"] }, 1, 0] } },
                    completedJobs: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "completed"] }, 1, 0] } },
                    canceledJobs: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "canceled"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // ✅ Track proposal status transitions
        const proposalsTransitions = await Proposal.aggregate([
            { $unwind: "$statusHistory" },
            {
                $group: {
                    _id: groupBy,
                    submitedProposals: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "pending"] }, 1, 0] } },
                    acceptedProposals: { $sum: { $cond: [{ $eq: ["$statusHistory.status", "accepted"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // ✅ Merge status transition data
        const mergedData = jobsTransitions.map(jobData => {
            const proposalData = proposalsTransitions.find(d => d._id === jobData._id) || {
                submitedProposals: 0,
                acceptedProposals: 0,
            };

            return {
                date: dateFormatter(jobData),
                activeJobs: jobData.activeJobs || 0,
                inProgressJobs: jobData.inProgressJobs || 0,
                completedJobs: jobData.completedJobs || 0,
                canceledJobs: jobData.canceledJobs || 0,
                submitedProposals: proposalData.submitedProposals || 0,
                acceptedProposals: proposalData.acceptedProposals || 0,
                totalActiveJobs,
                totalInProgressJobs,
                totalCompletedJobs,
                totalPendingProposals

            };
        });

        return NextResponse.json(mergedData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error fetching jobs & proposals transitions data" }, { status: 500 });
    }
}
