import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";
import Job from "@/models/jobs";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest) {
    await connectMongoDB(); // Ensure database connection

    try {
        const session = await getServerSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { proposalId } = await req.json();
        if (!proposalId) {
            return NextResponse.json({ error: "Missing proposalId" }, { status: 400 });
        }

        // Find the proposal and populate the associated job's clientId
        const proposal = await Proposal.findOneAndUpdate(
            { _id: proposalId },
            { status: "accepted" },
            { new: true }
        ).populate("jobId", "userId status"); // Fetch job details

        if (!proposal) {
            return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
        }

        // Ensure that only the job owner (client) can hire the freelancer
        if (proposal.jobId.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "You are not the job owner" }, { status: 403 });
        }

        // Update job status to "in-progress"
        const job = await Job.findByIdAndUpdate(
            proposal.jobId._id,
            { status: "in-progress" },
            { new: true }
        );

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Freelancer hired successfully",
            proposal,
            job
        }, { status: 200 });

    } catch (error) {
        console.error("Hire Freelancer Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
