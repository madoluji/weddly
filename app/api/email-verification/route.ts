export const dynamic = "force-dynamic"; // Ensures Next.js treats it as a dynamic route

import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Adjust import path
import VerificationToken from "@/models/token";
import User from "@/models/user";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ message: "Invalid or missing token" }, { status: 400 });
    }

    try {
        await connectMongoDB();

        const verificationToken = await VerificationToken.findOne({ token });
        if (!verificationToken) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }

        const user = await User.findOne({ email: verificationToken.email });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.emailVerified = true;
        await user.save();

        await VerificationToken.deleteOne({ token });

        return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error verifying email:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
