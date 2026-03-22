import { connectMongoDB } from "@/app/lib/mongodb";
import KYC from "@/models/kyc";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: userId } = params;
    try {
        await connectMongoDB();
        const { status } = await req.json();

        // Ensure the status is either "approved" or "rejected"
        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        // Start a transaction to update both collections atomically
        const session = await KYC.startSession();
        session.startTransaction();

        try {
            // Update the KYC collection
            const updatedKYC = await KYC.findOneAndUpdate(
                { userId },
                { status, verifiedAt: status === "approved" ? new Date() : null },
                { new: true, session }
            );

            if (!updatedKYC) {
                throw new Error("KYC record not found");
            }

            // Update the User collection (Set kycVerified to true if approved)
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { kycVerified: status === "approved" ? true : false },
                { new: true, session }
            );

            if (!updatedUser) {
                throw new Error("User not found");
            }

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            return NextResponse.json({
                message: "KYC verification updated successfully",
                kyc: updatedKYC,
                user: updatedUser
            }, { status: 200 });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ message: "Error updating KYC", error }, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ message: "Server error", error }, { status: 500 });
    }
}
