import { connectMongoDB } from "@/app/lib/mongodb";
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import {
    getAuditActorFromUser,
    getClientIpAddress,
    writeAdminAuditLog,
} from "@/app/lib/adminAudit";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import KYC from "@/models/kyc";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user, response } = authorizeAdminRequest(req);
    if (response) {
        return response;
    }

    const actor = getAuditActorFromUser(user);
    const ipAddress = getClientIpAddress(req);

    const { id: userId } = await params;
    try {
        await connectMongoDB();
        const { status } = await req.json();

        // Ensure the status is either "approved" or "rejected"
        if (!["approved", "rejected"].includes(status)) {
            await writeAdminAuditLog({
                ...actor,
                action: "kyc.status.update",
                resourceType: "kyc",
                resourceId: userId,
                status: "failed",
                errorMessage: "Invalid status",
                ipAddress,
                metadata: { requestedStatus: status },
            });
            return adminError("Invalid status", 400);
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

            await writeAdminAuditLog({
                ...actor,
                action: "kyc.status.update",
                resourceType: "kyc",
                resourceId: userId,
                status: "success",
                ipAddress,
                metadata: { status },
            });

            return adminSuccess({
                kyc: updatedKYC,
                user: updatedUser,
            }, "KYC verification updated successfully", 200);

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            await writeAdminAuditLog({
                ...actor,
                action: "kyc.status.update",
                resourceType: "kyc",
                resourceId: userId,
                status: "failed",
                errorMessage: "Error updating KYC",
                ipAddress,
                metadata: { status },
            });
            return adminError("Error updating KYC", 500);
        }

    } catch (error) {
        await writeAdminAuditLog({
            ...actor,
            action: "kyc.status.update",
            resourceType: "kyc",
            resourceId: userId,
            status: "failed",
            errorMessage: "Server error",
            ipAddress,
        });
        return adminError("Server error", 500);
    }
}
