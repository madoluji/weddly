import { NextRequest, NextResponse } from "next/server";
import { emitNotificationEventSafe } from "@/app/lib/notification-events";

type NewMessageNotificationBody = {
  recipientId?: string;
  messageId?: string;
  textPreview?: string;
  senderName?: string;
  senderAvatar?: string;
};

function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    const userData = req.headers.get("user");
    const user = userData ? JSON.parse(userData) : null;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const senderId = getUserIdFromRequest(req);
    if (!senderId) {
      return NextResponse.json({ message: "Unauthorized: No user data" }, { status: 401 });
    }

    const { recipientId, messageId, textPreview, senderName, senderAvatar }: NewMessageNotificationBody =
      await req.json();

    if (!recipientId) {
      return NextResponse.json({ message: "recipientId is required" }, { status: 400 });
    }

    if (recipientId === senderId) {
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    await emitNotificationEventSafe({
      eventType: "NEW_MESSAGE",
      userId: recipientId,
      title: senderName ? `New message from ${senderName}` : undefined,
      body: textPreview?.trim() ? textPreview.trim().slice(0, 140) : "You received a new message.",
      metadata: {
        recipientId,
        senderId,
        messageId,
        senderName,
        senderAvatar,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to emit new message notification:", error);
    return NextResponse.json({ message: "Failed to emit notification" }, { status: 500 });
  }
}
