import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";
import ClientInfo from "@/models/clientinfo";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB(); // Ensure DB connection

        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");
        const freelancerId = searchParams.get("freelancerId");
        const proposalId = searchParams.get("proposalId");
        const status = searchParams.get("status"); // Status filter: "all", "pending", "accepted", "rejected"

        // Define filter conditions dynamically
        const filter: any = {};
        if (jobId) filter.jobId = jobId;
        if (freelancerId) filter.userId = freelancerId;
        if (proposalId) filter._id = proposalId;

        // Apply status filtering only if it's NOT "all"
        if (status && status !== "all") {
            filter.status = status;
        }

        // Optimize query by selecting required fields & using `.lean()` for performance
        const proposals = await Proposal.find(filter)
            .select("jobId clientId userId bidAmount coverLetter attachments duration status createdAt") // Fetch only necessary fields
            .populate({ path: 'jobId', select: 'title budget experience description createdAt location locationMeta tags fileUrls eventDate fullName' })
            .lean(); // Convert to plain JSON object for faster response

        const clientIds = Array.from(
            new Set(
                proposals
                    .map((proposal: any) => proposal.clientId?.toString?.() || String(proposal.clientId))
                    .filter(Boolean)
            )
        );

        const clientInfoRows = await ClientInfo.find({ userId: { $in: clientIds } })
            .select("userId fullName targetWeddingDate")
            .lean();

        const clientInfoByUserId = new Map(
            clientInfoRows.map((row: any) => [String(row.userId), row])
        );

        const enrichedProposals = proposals.map((proposal: any) => {
            const clientInfo = clientInfoByUserId.get(
                proposal.clientId?.toString?.() || String(proposal.clientId)
            );

            return {
                ...proposal,
                clientDetails: clientInfo
                    ? {
                        fullName: clientInfo.fullName,
                        targetWeddingDate: clientInfo.targetWeddingDate,
                    }
                    : null,
            };
        });

        return NextResponse.json({ proposals: enrichedProposals }, { status: 200 });

    } catch (error) {
        console.error("Error fetching proposals:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
