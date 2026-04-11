import { NextRequest } from "next/server";
import AdminAudit from "@/models/adminAudit";
import { AuthenticatedUser } from "@/app/lib/adminRouteAuth";

type AdminAuditEntry = {
  actorAdminId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  status: "success" | "failed";
  errorMessage?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

export const getClientIpAddress = (req: NextRequest): string | undefined => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return undefined;
};

export const getAuditActorFromUser = (user: AuthenticatedUser | null) => ({
  actorAdminId: user?.id || user?._id,
  actorEmail: user?.email,
  actorRole: user?.role,
});

export const writeAdminAuditLog = async (entry: AdminAuditEntry) => {
  try {
    await AdminAudit.create(entry);
  } catch (error) {
    console.error("Failed to write admin audit log", error);
  }
};