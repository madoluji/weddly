import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class ServiceTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const serviceToken = request.headers["x-service-token"];
    const expectedToken = this.configService.get<string>("SERVICE_TOKEN");

    if (!expectedToken) {
      throw new UnauthorizedException("SERVICE_TOKEN is not configured");
    }

    const normalizedServiceToken = Array.isArray(serviceToken)
      ? serviceToken[0]
      : serviceToken;

    if (!normalizedServiceToken || normalizedServiceToken !== expectedToken) {
      throw new UnauthorizedException("Invalid service token");
    }

    return true;
  }
}
