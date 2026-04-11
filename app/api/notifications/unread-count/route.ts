import { NextRequest, NextResponse } from "next/server";

let lastServiceDownLogAt = 0;
const SERVICE_DOWN_LOG_INTERVAL_MS = 60_000;

function logNotificationServiceDown(error: unknown) {
  const now = Date.now();
  if (now - lastServiceDownLogAt < SERVICE_DOWN_LOG_INTERVAL_MS) {
    return;
  }

  lastServiceDownLogAt = now;
  const message = error instanceof Error ? error.message : "unknown error";
  console.warn(`Notification service unavailable for unread count (${message}). Returning fallback unreadCount=0.`);
}

function getNotificationServiceConfig() {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  const serviceToken = process.env.NOTIFICATION_SERVICE_TOKEN;

  if (!baseUrl || !serviceToken) {
    return null;
  }

  return { baseUrl, serviceToken };
}

function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }

    const config = getNotificationServiceConfig();
    if (!config) {
      return NextResponse.json({ unreadCount: 0, degraded: true }, { status: 200 });
    }

    const { baseUrl, serviceToken } = config;
    const url = `${baseUrl}/notifications/unread-count?userId=${encodeURIComponent(userId)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          "x-service-token": serviceToken,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(1500),
      });
    } catch (error) {
      logNotificationServiceDown(error);
      return NextResponse.json({ unreadCount: 0, degraded: true }, { status: 200 });
    }

    if (!response.ok) {
      return NextResponse.json({ unreadCount: 0, degraded: true }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Unexpected unread-count proxy failure:", error);
    return NextResponse.json({ unreadCount: 0, degraded: true }, { status: 200 });
  }
}
