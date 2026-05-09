import { Controller, Post, Body, Get, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("webhook")
  async handleClerkWebhook(@Body() payload: unknown) {
    // TODO: handle Clerk user.created / user.updated webhooks
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe() {
    // TODO: return current user from JWT
  }
}
