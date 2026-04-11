export const dynamic = "force-dynamic"; // Ensures Next.js treats it as a dynamic route

import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Adjust import path
import VerificationToken from "@/models/token";
import User from "@/models/user";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email")?.toLowerCase().trim();

    if (!token) {
        console.error("❌ No token provided");
        return NextResponse.json({ message: "Invalid or missing token" }, { status: 400 });
    }

    try {
        await connectMongoDB();

        console.log("🔍 Verifying token...");
        console.log("   Token (first 20 chars):", token.substring(0, 20) + "...");

        const verificationToken = await VerificationToken.findOne({ token });
        
        if (!verificationToken) {
            console.error("❌ Token not found in database");
            
            // Debug: Check how many tokens exist
            const tokenCount = await VerificationToken.countDocuments();
            console.log("   Total tokens in DB:", tokenCount);
            
            // Debug: Try to find any tokens with similar pattern
            const allTokens = await VerificationToken.find().select("token email createdAt expiresAt").limit(5);
            console.log("   Recent tokens (first 5):", allTokens.map(t => ({ 
                token: t.token.substring(0, 20) + "...", 
                email: t.email,
                createdAt: t.createdAt,
                expiresAt: t.expiresAt
            })));

            // If token is stale/consumed but user is already verified, treat as success.
            if (emailParam) {
                const alreadyVerifiedUser = await User.findOne({ email: emailParam })
                    .select("email emailVerified")
                    .lean<{ email: string; emailVerified: boolean }>();

                if (alreadyVerifiedUser?.emailVerified) {
                    console.log("✅ Token missing but email is already verified:", alreadyVerifiedUser.email);
                    return NextResponse.json({ message: "Email already verified" }, { status: 200 });
                }
            }
            
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }

        console.log("✅ Token found!");
        console.log("   Email:", verificationToken.email);
        console.log("   Created At:", verificationToken.createdAt);
        console.log("   Expires At:", verificationToken.expiresAt);
        console.log("   Current Time:", new Date());

        // Check if token has expired
        if (new Date() > verificationToken.expiresAt) {
            console.error("❌ Token has expired");
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return NextResponse.json({ message: "Token has expired. Please request a new verification link." }, { status: 400 });
        }

        console.log("✅ Token is valid, finding user...");

        const user = await User.findOne({ email: verificationToken.email });
        if (!user) {
            console.error("❌ User not found for email:", verificationToken.email);
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.emailVerified) {
            console.log("✅ Email already verified for user:", user.email);
            return NextResponse.json({ message: "Email already verified" }, { status: 200 });
        }

        user.emailVerified = true;
        await user.save();

        console.log("✅ Email verified for user:", user.email);

        await VerificationToken.deleteOne({ _id: verificationToken._id });

        return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    } catch (error) {
        console.error("❌ Error verifying email:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
