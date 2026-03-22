import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB(); // Ensure DB connection

        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const jobId = searchParams.get("jobId");
        const freelancerId = searchParams.get("freelancerId");
        const status = searchParams.get("status"); // Status filter: "all", "pending", "accepted", "rejected"

        // Define filter conditions dynamically
        const filter: any = {};
        if (jobId) filter.jobId = jobId;
        if (freelancerId) filter.userId = freelancerId;

        // Apply status filtering only if it's NOT "all"
        if (status && status !== "all") {
            filter.status = status;
        }

        // Optimize query by selecting required fields & using `.lean()` for performance
        const proposals = await Proposal.find(filter)
            .select("jobId clientId userId bidAmount coverLetter status createdAt") // Fetch only necessary fields
            .populate({ path: 'jobId', select: 'title budget experience description createdAt' })
            .lean(); // Convert to plain JSON object for faster response

        return NextResponse.json({ proposals }, { status: 200 });

    } catch (error) {
        console.error("Error fetching proposals:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
