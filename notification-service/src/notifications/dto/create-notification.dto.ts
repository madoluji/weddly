import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { NotificationChannel, NotificationStatus } from "../schemas/notification.schema";

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel?: NotificationChannel;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
