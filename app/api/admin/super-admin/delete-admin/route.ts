import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Import your DB connection utility
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import {
    getAuditActorFromUser,
    getClientIpAddress,
    writeAdminAuditLog,
} from "@/app/lib/adminAudit";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import Admin from "@/models/admin";


export async function DELETE(req: NextRequest) {
    const { user, response } = authorizeAdminRequest(req, ["superadmin"]);
    if (response) {
        return response;
    }

    const actor = getAuditActorFromUser(user);
    const ipAddress = getClientIpAddress(req);

    try {
        // Connect to MongoDB
        await connectMongoDB();

        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId") || user?.id;

        if (!adminId) {
            await writeAdminAuditLog({
                ...actor,
                action: "admin.delete",
                resourceType: "admin",
                status: "failed",
                errorMessage: "Admin ID is required",
                ipAddress,
            });
            return adminError("Admin ID is required", 400);
        }

        const count = await Admin.deleteOne({ _id: adminId });
        if (count.deletedCount === 0) {
            await writeAdminAuditLog({
                ...actor,
                action: "admin.delete",
                resourceType: "admin",
                resourceId: adminId,
                status: "failed",
                errorMessage: "Admin not found",
                ipAddress,
            });
            return adminError("Admin not found", 404);
        }

        await writeAdminAuditLog({
            ...actor,
            action: "admin.delete",
            resourceType: "admin",
            resourceId: adminId,
            status: "success",
            ipAddress,
        });

        return adminSuccess(undefined, "Admin account deleted successfully", 200);
    }
    catch (error) {
        console.error("Error deleting admin account:", error);
        await writeAdminAuditLog({
            ...actor,
            action: "admin.delete",
            resourceType: "admin",
            status: "failed",
            errorMessage: "Internal Server Error",
            ipAddress,
        });
        return adminError("Internal Server Error", 500);
    }
}
