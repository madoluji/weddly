import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationEventDto } from "./dto/notification-event.dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Post("events")
  async ingestEvent(
    @Body() dto: NotificationEventDto,
    @Headers("x-service-token") serviceToken: string,
  ) {
    const expectedToken = this.configService.get<string>("SERVICE_TOKEN");

    if (!expectedToken || serviceToken !== expectedToken) {
      throw new BadRequestException("Invalid service token");
    }

    const job = await this.notificationsService.enqueueEvent({
      eventType: dto.eventType,
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      metadata: dto.metadata ?? {},
    });

    return { accepted: true, jobId: job.id };
  }

  @Get()
  async getUserNotifications(
    @Query("userId") userId: string,
    @Query("limit") limit = "20",
    @Query("cursor") cursor?: string,
  ) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }

    const parsedLimit = Number(limit);
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      throw new BadRequestException("limit must be a positive number");
    }

    return this.notificationsService.listForUser(userId, parsedLimit, cursor);
  }

  @Get("unread-count")
  async getUnreadCount(@Query("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }

    return this.notificationsService.unreadCount(userId);
  }

  @Patch(":id/read")
  async markRead(@Param("id") id: string, @Query("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }

    return this.notificationsService.markAsRead(id, userId);
  }
}
