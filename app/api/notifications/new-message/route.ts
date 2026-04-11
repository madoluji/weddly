import { NextRequest, NextResponse } from "next/server";
import { emitNotificationEventSafe } from "@/app/lib/notification-events";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../../models/user";

type NewMessageNotificationBody = {
  recipientId?: string;
  messageId?: string;
  textPreview?: string;
  senderName?: string;
  senderAvatar?: string;
};

type RequestUser = {
  id?: string;
  username?: string;
  name?: string;
  lastName?: string;
  email?: string;
};

const GENERIC_SENDER_LABELS = new Set([
  "someone",
  "user",
  "client",
  "freelancer",
  "venue",
]);

function normalizeSenderName(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (GENERIC_SENDER_LABELS.has(trimmed.toLowerCase())) {
    return null;
  }

  return trimmed;
}

function buildNameFromParts(input: {
  username?: string | null;
  name?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string | null {
  const username = normalizeSenderName(input.username);
  if (username) {
    return username;
  }

  const first = typeof input.name === "string" ? input.name.trim() : "";
  const last = typeof input.lastName === "string" ? input.lastName.trim() : "";
  const full = normalizeSenderName(`${first} ${last}`.trim());
  if (full) {
    return full;
  }

  const firstOnly = normalizeSenderName(first);
  if (firstOnly) {
    return firstOnly;
  }

  if (typeof input.email === "string") {
    const local = normalizeSenderName(input.email.split("@")[0]);
    if (local) {
      return local;
    }
  }

  return null;
}

function getUserFromRequest(req: NextRequest): RequestUser | null {
  try {
    const userData = req.headers.get("user");
    const user = userData ? (JSON.parse(userData) as RequestUser) : null;
    return user;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const requestUser = getUserFromRequest(req);
    const senderId = requestUser?.id ?? null;
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

    let resolvedSenderName = normalizeSenderName(senderName);

    if (!resolvedSenderName) {
      resolvedSenderName = buildNameFromParts({
        username: requestUser?.username,
        name: requestUser?.name,
        lastName: requestUser?.lastName,
        email: requestUser?.email,
      });
    }

    if (!resolvedSenderName) {
      try {
        await connectMongoDB();
        const senderProfile = await User.findById(senderId)
          .select("name lastName email")
          .lean<{ name?: string; lastName?: string; email?: string }>();

        resolvedSenderName = buildNameFromParts({
          name: senderProfile?.name,
          lastName: senderProfile?.lastName,
          email: senderProfile?.email,
        });
      } catch (lookupError) {
        console.warn("Sender profile lookup failed for notification naming:", lookupError);
      }
    }

    await emitNotificationEventSafe({
      eventType: "NEW_MESSAGE",
      userId: recipientId,
      title: resolvedSenderName ? `New message from ${resolvedSenderName}` : undefined,
      body: textPreview?.trim() ? textPreview.trim().slice(0, 140) : "You received a new message.",
      metadata: {
        recipientId,
        senderId,
        messageId,
        senderName: resolvedSenderName,
        senderAvatar,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to emit new message notification:", error);
    return NextResponse.json({ message: "Failed to emit notification" }, { status: 500 });
  }
}
