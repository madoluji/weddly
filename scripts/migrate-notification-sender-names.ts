import "dotenv/config";
import mongoose, { Types } from "mongoose";

type NotificationRecord = {
  _id: Types.ObjectId;
  type: string;
  title?: string;
  metadata?: Record<string, unknown>;
};

type UserRecord = {
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

const normalizeSenderName = (value: unknown): string | null => {
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
};

const parseSenderNameFromTitle = (title: unknown): string | null => {
  if (typeof title !== "string") {
    return null;
  }

  const match = title.match(/^new message from\s+(.+)$/i);
  if (!match?.[1]) {
    return null;
  }

  return normalizeSenderName(match[1]);
};

const buildSenderName = (user: UserRecord | null | undefined): string | null => {
  if (!user) {
    return null;
  }

  const username = normalizeSenderName(user.username);
  if (username) {
    return username;
  }

  const first = typeof user.name === "string" ? user.name.trim() : "";
  const last = typeof user.lastName === "string" ? user.lastName.trim() : "";
  const fullName = normalizeSenderName(`${first} ${last}`.trim());
  if (fullName) {
    return fullName;
  }

  const firstOnly = normalizeSenderName(first);
  if (firstOnly) {
    return firstOnly;
  }

  if (typeof user.email === "string" && user.email.includes("@")) {
    const localPart = normalizeSenderName(user.email.split("@")[0]);
    if (localPart) {
      return localPart;
    }
  }

  return null;
};

const isGenericOrMissingSenderName = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  return GENERIC_SENDER_LABELS.has(trimmed.toLowerCase());
};

const main = async () => {
  const dryRun = process.argv.includes("--dry-run");
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error("Missing required environment variable: MONGODB_URI");
  }

  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("MongoDB connection has no active database handle.");
  }

  const notifications = db.collection<NotificationRecord>("notifications");
  const users = db.collection<UserRecord>("users");

  const senderNameCache = new Map<string, string | null>();

  let scanned = 0;
  let patched = 0;
  let unresolved = 0;

  const cursor = notifications.find(
    { type: "NEW_MESSAGE" },
    {
      projection: {
        title: 1,
        metadata: 1,
      },
    }
  );

  for await (const notification of cursor) {
    scanned += 1;

    const metadata =
      notification.metadata && typeof notification.metadata === "object"
        ? notification.metadata
        : {};

    const metadataSenderName = normalizeSenderName(metadata.senderName);
    const titleSenderName = parseSenderNameFromTitle(notification.title);

    let resolvedSenderName = metadataSenderName || titleSenderName;

    if (!resolvedSenderName) {
      const senderIdRaw = metadata.senderId;
      const senderId = typeof senderIdRaw === "string" ? senderIdRaw.trim() : "";

      if (senderId) {
        if (senderNameCache.has(senderId)) {
          resolvedSenderName = senderNameCache.get(senderId) || null;
        } else {
          const query = Types.ObjectId.isValid(senderId)
            ? { $or: [{ _id: senderId }, { _id: new Types.ObjectId(senderId) }] }
            : { _id: senderId };

          const sender = await users.findOne(query, {
            projection: {
              username: 1,
              name: 1,
              lastName: 1,
              email: 1,
            },
          });

          resolvedSenderName = buildSenderName(sender);
          senderNameCache.set(senderId, resolvedSenderName);
        }
      }
    }

    if (!resolvedSenderName) {
      unresolved += 1;
      continue;
    }

    const titleNeedsPatch =
      typeof notification.title !== "string" ||
      notification.title.trim().length === 0 ||
      /^new message from\s+/i.test(notification.title) ||
      isGenericOrMissingSenderName(parseSenderNameFromTitle(notification.title));

    const metadataNeedsPatch = isGenericOrMissingSenderName(metadata.senderName);

    if (!titleNeedsPatch && !metadataNeedsPatch) {
      continue;
    }

    patched += 1;

    if (!dryRun) {
      const setPayload: Record<string, unknown> = {};
      if (metadataNeedsPatch) {
        setPayload["metadata.senderName"] = resolvedSenderName;
      }
      if (titleNeedsPatch) {
        setPayload.title = `New message from ${resolvedSenderName}`;
      }

      if (Object.keys(setPayload).length > 0) {
        await notifications.updateOne({ _id: notification._id }, { $set: setPayload });
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        scanned,
        patched,
        unresolved,
      },
      null,
      2
    )
  );
};

main()
  .catch((error) => {
    console.error("Failed to migrate notification sender names:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
