import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb";
import { authorizeAdminRequest } from "@/app/lib/adminRouteAuth";
import { adminError, adminSuccess } from "@/app/lib/adminApiResponse";
import AdminAudit from "@/models/adminAudit";

export async function GET(req: NextRequest) {
  const { response } = authorizeAdminRequest(req, ["superadmin"]);
  if (response) {
    return response;
  }

  try {
    await connectMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const action = searchParams.get("action")?.trim();
    const status = searchParams.get("status")?.trim();
    const actorEmail = searchParams.get("actorEmail")?.trim();
    const from = searchParams.get("from")?.trim();
    const to = searchParams.get("to")?.trim();
    const sortBy = searchParams.get("sortBy")?.trim() || "newest";
    const format = searchParams.get("format")?.trim();

    const query: Record<string, unknown> = {};
    if (action) {
      query.action = { $regex: action, $options: "i" };
    }
    if (status === "success" || status === "failed") {
      query.status = status;
    }
    if (actorEmail) {
      query.actorEmail = { $regex: actorEmail, $options: "i" };
    }
    if (from || to) {
      const createdAt: { $gte?: Date; $lte?: Date } = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          createdAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          // End-of-day for inclusive date filtering.
          toDate.setHours(23, 59, 59, 999);
          createdAt.$lte = toDate;
        }
      }
      if (createdAt.$gte || createdAt.$lte) {
        query.createdAt = createdAt;
      }
    }

    const skip = (page - 1) * limit;
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      action_asc: { action: 1, createdAt: -1 },
      action_desc: { action: -1, createdAt: -1 },
      status_asc: { status: 1, createdAt: -1 },
      status_desc: { status: -1, createdAt: -1 },
    };
    const sort = sortMap[sortBy] || sortMap.newest;

    if (format === "csv") {
      const csvItems = await AdminAudit.find(query)
        .sort(sort)
        .limit(5000)
        .lean();

      const headers = [
        "createdAt",
        "actorEmail",
        "actorRole",
        "action",
        "resourceType",
        "resourceId",
        "status",
        "errorMessage",
        "ipAddress",
      ];

      const escapeCsv = (value: unknown) => {
        const text = String(value ?? "").replace(/"/g, '""');
        return `"${text}"`;
      };

      const rows = csvItems.map((item: any) =>
        [
          item.createdAt,
          item.actorEmail,
          item.actorRole,
          item.action,
          item.resourceType,
          item.resourceId,
          item.status,
          item.errorMessage,
          item.ipAddress,
        ]
          .map(escapeCsv)
          .join(",")
      );

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="admin-audit-logs-${Date.now()}.csv"`,
        },
      });
    }

    const [items, total] = await Promise.all([
      AdminAudit.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminAudit.countDocuments(query),
    ]);

    return adminSuccess(
      {
        logs: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Audit logs fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching admin audit logs:", error);
    return adminError("Error fetching admin audit logs", 500);
  }
}