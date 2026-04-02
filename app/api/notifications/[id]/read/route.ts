import { NextRequest, NextResponse } from "next/server";

function getNotificationServiceConfig() {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  const serviceToken = process.env.NOTIFICATION_SERVICE_TOKEN;

  if (!baseUrl || !serviceToken) {
    throw new Error("Notification service is not configured");
  }

  return { baseUrl, serviceToken };
}

function getUserIdFromRequest(req: NextRequest): string | null {
  const userData = req.headers.get("user");
  const user = userData ? JSON.parse(userData) : null;
  return user?.id ?? null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }

    const { id } = await params;
    const { baseUrl, serviceToken } = getNotificationServiceConfig();

    const response = await fetch(
      `${baseUrl}/notifications/${encodeURIComponent(id)}/read?userId=${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: {
          "x-service-token": serviceToken,
        },
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return NextResponse.json({ message: "Failed to mark notification as read" }, { status: 500 });
  }
}
