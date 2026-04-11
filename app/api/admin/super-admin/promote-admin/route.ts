import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb"; // Import MongoDB connection utility
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import {
    getAuditActorFromUser,
    getClientIpAddress,
    writeAdminAuditLog,
} from "@/app/lib/adminAudit";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import Admin from "@/models/admin"; // Import Admin model


export async function PATCH(req: NextRequest) {
    const { user, response } = authorizeAdminRequest(req, ["superadmin"]);
    if (response) {
        return response;
    }

    const actor = getAuditActorFromUser(user);
    const ipAddress = getClientIpAddress(req);

    try {


        // Extract adminId from request body
        const { adminId } = await req.json();
        if (!adminId) {
            await writeAdminAuditLog({
                ...actor,
                action: "admin.promote",
                resourceType: "admin",
                status: "failed",
                errorMessage: "Admin ID is required",
                ipAddress,
            });
            return adminError("Admin ID is required", 400);
        }

        // Connect to MongoDB
        await connectMongoDB();

        // Check if the target admin exists
        const adminToPromote = await Admin.findOne({ _id: adminId });
        if (!adminToPromote) {
            await writeAdminAuditLog({
                ...actor,
                action: "admin.promote",
                resourceType: "admin",
                resourceId: adminId,
                status: "failed",
                errorMessage: "Admin not found",
                ipAddress,
            });
            return adminError("Admin not found", 404);
        }

        // Check if already a superadmin
        if (adminToPromote.role === "superadmin") {
            await writeAdminAuditLog({
                ...actor,
                action: "admin.promote",
                resourceType: "admin",
                resourceId: adminId,
                status: "failed",
                errorMessage: "Admin is already a superadmin",
                ipAddress,
            });
            return adminError("Admin is already a superadmin", 400);
        }

        // Update the role to superadmin
        await Admin.updateOne({ _id: adminId }, { $set: { role: "superadmin" } });

        await writeAdminAuditLog({
            ...actor,
            action: "admin.promote",
            resourceType: "admin",
            resourceId: adminId,
            status: "success",
            ipAddress,
            metadata: { promotedRole: "superadmin" },
        });

        return adminSuccess(undefined, "Admin successfully promoted to superadmin", 200);

    } catch (error) {
        console.error("Error promoting admin:", error);
        await writeAdminAuditLog({
            ...actor,
            action: "admin.promote",
            resourceType: "admin",
            status: "failed",
            errorMessage: "Internal Server Error",
            ipAddress,
        });
        return adminError("Internal Server Error", 500);
    }
}
