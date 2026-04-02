import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Notification, NotificationDocument, NotificationStatus } from "./schemas/notification.schema";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectQueue("notification-events")
    private readonly notificationEventsQueue: Queue,
  ) {}

  async enqueueEvent(payload: {
    eventType: string;
    userId: string;
    title?: string;
    body?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.notificationEventsQueue.add("ingest", payload, {
      attempts: 4,
      backoff: {
        type: "exponential",
        delay: 1500,
      },
      removeOnComplete: 200,
      removeOnFail: 500,
    });
  }

  async create(dto: CreateNotificationDto) {
    const created = await this.notificationModel.create({
      ...dto,
      status: dto.status ?? NotificationStatus.PENDING,
      metadata: dto.metadata ?? {},
    });

    return created;
  }

  async listForUser(userId: string, limit = 20, cursor?: string) {
    const query: Record<string, unknown> = { userId };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    return this.notificationModel.find(query).sort({ _id: -1 }).limit(limit).lean();
  }

  async unreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({ userId, readAt: null });
    return { userId, unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { readAt: new Date(), status: NotificationStatus.SENT } },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException("Notification not found");
    }

    return updated;
  }

  mapEventToNotification(eventType: string, metadata: Record<string, unknown> = {}) {
    const eventMap: Record<string, { title: string; body: string }> = {
      USER_REGISTERED: {
        title: "Welcome to Weddly",
        body: "Your account has been created successfully.",
      },
      PROPOSAL_SUBMITTED: {
        title: "Proposal submitted",
        body: "Your proposal was submitted and is pending review.",
      },
      CONTRACT_ACCEPTED: {
        title: "Contract accepted",
        body: "A contract has been accepted. Check your dashboard for details.",
      },
      PAYMENT_SUCCESS: {
        title: "Payment successful",
        body: "Payment completed successfully.",
      },
      NEW_MESSAGE: {
        title: "New message",
        body: "You received a new message.",
      },
    };

    const fallback = {
      title: "New update",
      body: "You have a new notification.",
    };

    return {
      ...(eventMap[eventType] ?? fallback),
      metadata,
    };
  }
}
