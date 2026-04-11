import { NextRequest, NextResponse } from "next/server";
import KYC from "@/models/kyc";
import { connectMongoDB } from "@/app/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await connectMongoDB();

    try {
        // Check if user already has a pending KYC submission
        const pendingKYC = await KYC.findOne({ userId: session.user.id, status: "pending" }).select("_id submittedAt");
        
        if (pendingKYC) {
            const submittedTime = new Date(pendingKYC.submittedAt);
            const now = new Date();
            const minutesDiff = Math.floor((now.getTime() - submittedTime.getTime()) / (1000 * 60));
            
            // Allow resubmission only after 24 hours
            if (minutesDiff < 1440) {
                return NextResponse.json(
                    { 
                        message: "You already have a pending KYC submission. Please wait for admin verification or resubmit after 24 hours.",
                        alreadySubmitted: true 
                    },
                    { status: 400 }
                );
            }
        }

        const payload = {
            ...data,
            userId: session.user.id,
            email: session.user.email,
            address: {
                ...data?.address,
                wardNumber:
                    data?.address?.wardNumber !== undefined && data?.address?.wardNumber !== ""
                        ? Number(data.address.wardNumber)
                        : data?.address?.wardNumber,
            },
        };

        const existing = await KYC.findOne({ userId: session.user.id }).select("_id");

        await KYC.findOneAndUpdate(
            { userId: session.user.id },
            { $set: payload },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(
            { message: existing ? "KYC updated successfully" : "KYC submitted successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error submitting KYC:", error);

        if (error?.code === 11000) {
            const duplicateField = Object.keys(error?.keyPattern || {})[0] || "field";
            return NextResponse.json(
                { message: `Duplicate value for ${duplicateField}. Please check your KYC details.` },
                { status: 409 }
            );
        }

        if (error?.name === "ValidationError") {
            const validationMessage =
                Object.values(error.errors || {})
                    .map((e: any) => e?.message)
                    .filter(Boolean)
                    .join(", ") || "Invalid KYC data.";
            return NextResponse.json({ message: validationMessage }, { status: 400 });
        }

        return NextResponse.json({ message: "Error submitting KYC" }, { status: 500 });
    }
}