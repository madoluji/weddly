import { connectMongoDB } from "@/app/lib/mongodb";
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import {
  getAuditActorFromUser,
  getClientIpAddress,
  writeAdminAuditLog,
} from "@/app/lib/adminAudit";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user, response } = authorizeAdminRequest(req);
  if (response) {
    return response;
  }

  const actor = getAuditActorFromUser(user);
  const ipAddress = getClientIpAddress(req);

  await connectMongoDB();

  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!user || !user.id) {
    await writeAdminAuditLog({
      ...actor,
      action: "admin.password.change",
      resourceType: "admin",
      resourceId: user?.id,
      status: "failed",
      errorMessage: "Unauthorized: No user data",
      ipAddress,
    });
    return adminError("Unauthorized: No user data", 401);
  }

  try {
    const admin = await Admin.findOne({ userName: user?.email });
    if (!admin) {
      await writeAdminAuditLog({
        ...actor,
        action: "admin.password.change",
        resourceType: "admin",
        resourceId: user.id,
        status: "failed",
        errorMessage: "Admin not found",
        ipAddress,
      });
      return adminError("Admin not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      await writeAdminAuditLog({
        ...actor,
        action: "admin.password.change",
        resourceType: "admin",
        resourceId: admin._id.toString(),
        status: "failed",
        errorMessage: "Current password is incorrect",
        ipAddress,
      });
      return adminError("Current password is incorrect", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Admin.updateOne(
      { _id: admin._id },
      {
        $set: { password: hashedPassword },
        $unset: { isFirstLogin: "" },
      }
    );

    await writeAdminAuditLog({
      ...actor,
      action: "admin.password.change",
      resourceType: "admin",
      resourceId: admin._id.toString(),
      status: "success",
      ipAddress,
    });

    return adminSuccess(undefined, "Password changed successfully", 200);
  } catch (error) {
    console.error("Error changing password:", error);
    await writeAdminAuditLog({
      ...actor,
      action: "admin.password.change",
      resourceType: "admin",
      resourceId: user.id,
      status: "failed",
      errorMessage: "Error changing password",
      ipAddress,
    });
    return adminError("Error changing password", 500);
  }
}
