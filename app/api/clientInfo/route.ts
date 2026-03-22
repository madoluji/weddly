import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import { NextRequest } from "next/server";
import ClientInfo from "@/models/clientinfo";
import User from "@/models/user";

interface ClientRequestBody {
    userId: string;
    fullName: string;
    isCompany: boolean;
    industry: string[];
    companySize?: "Startup" | "Small" | "Medium" | "Large";
    location: string;
    preferredSkills: string[];
    averageBudget: number;
}

export async function POST(req: NextRequest) {
    try {
        const {
            userId,
            fullName,
            isCompany,
            industry,
            companySize,
            location,
            preferredSkills,
            averageBudget,
        }: ClientRequestBody = await req.json();

        await connectMongoDB();

        // Save the client data in the database
        await ClientInfo.create({
            userId,
            fullName,
            isCompany,
            industry,
            companySize,
            location,
            preferredSkills,
            averageBudget,
        });

        // Update the user role to client
        await User.updateOne({ _id: userId }, { $set: { "roles.client": true } });

        const responseData = {
            userId,
            fullName,
            isCompany,
            industry,
            companySize,
            location,
            preferredSkills,
            averageBudget,
        };

        return NextResponse.json(
            { message: "Client Registered Successfully", data: responseData },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
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
