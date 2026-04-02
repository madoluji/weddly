import { NextRequest, NextResponse } from "next/server";

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

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ?? "20";
    const cursor = searchParams.get("cursor");

    const config = getNotificationServiceConfig();
    if (!config) {
      return NextResponse.json([], { status: 200 });
    }

    const { baseUrl, serviceToken } = config;

    const url = new URL(`${baseUrl}/notifications`);
    url.searchParams.set("userId", userId);
    url.searchParams.set("limit", limit);
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "x-service-token": serviceToken,
        },
        cache: "no-store",
      });
    } catch (error) {
      console.warn("Notification service unavailable while listing notifications", error);
      return NextResponse.json([], { status: 200 });
    }

    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Unexpected notifications proxy failure:", error);
    return NextResponse.json([], { status: 200 });
  }
}
