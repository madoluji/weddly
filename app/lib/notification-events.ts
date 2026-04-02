type NotificationEventType =
  | "USER_REGISTERED"
  | "PROPOSAL_SUBMITTED"
  | "CONTRACT_ACCEPTED"
  | "PAYMENT_SUCCESS"
  | "NEW_MESSAGE";

type NotificationEventPayload = {
  eventType: NotificationEventType;
  userId: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
};

export async function emitNotificationEventSafe(payload: NotificationEventPayload): Promise<void> {
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  const serviceToken = process.env.NOTIFICATION_SERVICE_TOKEN;

  if (!baseUrl || !serviceToken) {
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/notifications/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-service-token": serviceToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Notification service returned non-OK:", response.status, body);
    }
  } catch (error) {
    console.error("Notification service call failed:", error);
  }
}
