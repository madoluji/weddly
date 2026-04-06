import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/models/user";
import Review from "@/models/projectindividualreview";
import { NextRequest, NextResponse } from "next/server";

function getNotificationServiceConfig() {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  const serviceToken = process.env.NOTIFICATION_SERVICE_TOKEN;
  if (!baseUrl || !serviceToken) {
    return null;
  }
  return { baseUrl, serviceToken };
}

async function fetchUnreadNotifications(userId: string) {
  const config = getNotificationServiceConfig();
  if (!config) {
    return 0;
  }

  try {
    const response = await fetch(
      `${config.baseUrl}/notifications/unread-count?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          "x-service-token": config.serviceToken,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    return typeof data.unreadCount === "number" ? data.unreadCount : 0;
  } catch (error) {
    console.warn("Failed to fetch unread notification count", error);
    return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, latestReviews, unreadNotifications] = await Promise.all([
      User.findById(userId).select("roles").lean(),
      Review.find({ revieweeId: userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      fetchUnreadNotifications(userId),
    ]);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        roles: user.roles ?? {},
        unreadNotifications,
        latestReviews: latestReviews ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
