type NotifyEventPayload = {
  eventType: "USER_REGISTERED" | "PROPOSAL_SUBMITTED" | "CONTRACT_ACCEPTED" | "PAYMENT_SUCCESS";
  userId: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
};

export async function emitNotificationEvent(payload: NotifyEventPayload) {
  const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
  const serviceToken = process.env.NOTIFICATION_SERVICE_TOKEN;

  if (!notificationServiceUrl || !serviceToken) {
    // Keep main app resilient if notification service is not configured yet.
    return;
  }

  const response = await fetch(`${notificationServiceUrl}/notifications/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-service-token": serviceToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notification event failed: ${response.status} ${text}`);
  }
}
