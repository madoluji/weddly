import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";

@Controller("health")
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      ok: true,
      service: "weddly-notification-service",
      timestamp: new Date().toISOString(),
    };
  }
}
