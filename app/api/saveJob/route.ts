import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import SavedJobs from "@/models/savedJobs";

// POST: Save/Unsave a Job
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { jobId } = await req.json();  // Get jobId from the request body

    try {
        await connectMongoDB();

        // Check if the job is already saved by the user
        const existingSavedJob = await SavedJobs.findOne({ userId, jobId });

        if (existingSavedJob) {
            // If the job is already saved, remove it (unsave)
            await SavedJobs.deleteOne({ userId, jobId });
            return NextResponse.json({ message: "Job unsaved successfully" });
        } else {
            // If the job is not saved, create a new saved job entry
            const newSavedJob = new SavedJobs({ userId, jobId });
            await newSavedJob.save();
            return NextResponse.json({ message: "Job saved successfully" });
        }
    } catch (error) {
        console.error("Error saving/unsaving job:", error);
        return NextResponse.json({ message: "Error processing request" }, { status: 500 });
    }
}