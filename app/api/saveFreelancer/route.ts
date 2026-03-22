import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import SavedFreelancers from "@/models/savedFreelancers";

// POST: Save/Unsave a Freelancer
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { freelancerId } = await req.json();  // Get freelancerId from the request body

    try {
        await connectMongoDB();

        // Check if the freelancer is already saved by the user
        const existingSavedFreelancer = await SavedFreelancers.findOne({ userId, freelancerId });

        if (existingSavedFreelancer) {
            // If the freelancer is already saved, remove it (unsave)
            await SavedFreelancers.deleteOne({ userId, freelancerId });
            return NextResponse.json({ message: "Freelancer unsaved successfully" });
        } else {
            // If the freelancer is not saved, create a new saved freelancer entry
            const newSavedFreelancer = new SavedFreelancers({ userId, freelancerId });
            await newSavedFreelancer.save();
            return NextResponse.json({ message: "Freelancer saved successfully" });
        }
    } catch (error) {
        console.error("Error saving/unsaving freelancer:", error);
        return NextResponse.json({ message: "Error processing request" }, { status: 500 });
    }
}