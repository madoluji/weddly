import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";
import ClientInfo from "@/models/clientinfo";
import { getCacheValue, setCacheValue } from "@/app/lib/serverCache";

const JOB_PROPOSAL_TTL_MS = 60 * 1000;

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");
        const freelancerId = searchParams.get("freelancerId");
        const proposalId = searchParams.get("proposalId");
        const status = searchParams.get("status"); // Status filter: "all", "pending", "accepted", "rejected"

        const cacheKey = `jobproposal:${searchParams.toString()}`;
        const cached = getCacheValue<{ proposals: unknown[] }>(cacheKey);
        if (cached) {
            return NextResponse.json(cached, {
                status: 200,
                headers: {
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                    "X-Cache": "HIT",
                },
            });
        }

        await connectMongoDB(); // Ensure DB connection

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

        const payload = { proposals: enrichedProposals };
        setCacheValue(cacheKey, payload, JOB_PROPOSAL_TTL_MS);

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
                "X-Cache": "MISS",
            },
        });

    } catch (error) {
        console.error("Error fetching proposals:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
