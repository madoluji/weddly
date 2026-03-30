import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import ClientInfo from "@/models/clientinfo";
import User from "@/models/user";

interface ClientRequestBody {
    userId: string;
    fullName: string;
    isWeddingPlanner: boolean;
    weddingStyle: string;
    targetWeddingDate: string;
    location: string;
    averageBudget: number;
}

export async function POST(req: NextRequest) {
    try {
        const {
            userId,
            fullName,
            isWeddingPlanner,
            weddingStyle,
            targetWeddingDate,
            location,
            averageBudget,
        }: ClientRequestBody = await req.json();

        await connectMongoDB();

        // Save or update the client data in the database (upsert handles re-submissions)
        await ClientInfo.findOneAndUpdate(
            { userId },
            {
                fullName,
                isWeddingPlanner,
                weddingStyle,
                targetWeddingDate,
                location,
                averageBudget,
            },
            { upsert: true, new: true, runValidators: true }
        );

        // Update the user role to client
        await User.updateOne({ _id: userId }, { $set: { "roles.client": true } });

        const responseData = {
            userId,
            fullName,
            isWeddingPlanner,
            weddingStyle,
            targetWeddingDate,
            location,
            averageBudget,
        };

        return NextResponse.json(
            { message: "Client Registered Successfully", data: responseData },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("ClientInfo API Error:", error?.message || error);
        return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        await connectMongoDB();

        // Find the client data by userId
        const client = await ClientInfo.findOne({ userId });

        if (!client) {
            return NextResponse.json({ message: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({ client }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
