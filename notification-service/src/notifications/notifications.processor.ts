import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { NotificationChannel, NotificationStatus } from "./schemas/notification.schema";
import { NotificationsService } from "./notifications.service";

type NotificationEventJobData = {
  eventType: string;
  userId: string;
  title?: string;
  body?: string;
  metadata?: Record<string, unknown>;
};

@Processor("notification-events")
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job<NotificationEventJobData>) {
    const mapped = this.notificationsService.mapEventToNotification(job.data.eventType, job.data.metadata ?? {});

    await this.notificationsService.create({
      userId: job.data.userId,
      type: job.data.eventType,
      title: job.data.title ?? mapped.title,
      body: job.data.body ?? mapped.body,
      metadata: job.data.metadata ?? {},
      channel: NotificationChannel.IN_APP,
      status: NotificationStatus.SENT,
    });

    return { ok: true };
  }
}
