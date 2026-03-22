import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import Proposal from "@/models/proposal";
import { getServerSession } from "next-auth";
import Jobs from "@/models/jobs";
import User from "@/models/user";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    await connectMongoDB(); // Ensure database connection

    try {
        const session = await getServerSession(); // Get user session
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userData = req.headers.get("user");
        const user = userData ? JSON.parse(userData) : null;
        const userFromDB = await User.findById(id);
        if (!userFromDB || !userFromDB.emailVerified) {
            return NextResponse.json({ message: "Unauthorized: email not verified" }, { status: 400 });
        }

        const { jobId, bidAmount, coverLetter, duration, attachments } = await req.json();

        if (!jobId || !bidAmount || !coverLetter || !duration) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch job to get clientId
        const job = await Jobs.findById(jobId);
        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        const clientId = job.userId;

        // Check if a proposal already exists for this job and user
        const existingProposal = await Proposal.find({ jobId: jobId, userId: id });

        if (existingProposal.length > 0) {
            return NextResponse.json({ error: "You have already submitted a proposal for this job" }, { status: 409 });
        }

        // Create new proposal
        const newProposal = await Proposal.create({
            jobId,
            userId: id, // Get user ID from session
            clientId,
            bidAmount,
            coverLetter,
            duration,
            attachments,
        });

        return NextResponse.json({ message: "Proposal submitted successfully", proposal: newProposal }, { status: 201 });
    } catch (error) {
        console.error("Proposal Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}   