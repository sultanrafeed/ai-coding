import { Controller, Post, Body, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { AiService } from "./ai.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("explain-error")
  async explainError(
    @Body() body: { code: string; error: string; problemId: string },
    @Res() res: Response,
  ) {
    // TODO: proxy stream from AI service
    res.setHeader("Content-Type", "text/event-stream");
    await this.aiService.streamExplainError(body, res);
  }

  @Post("hint")
  async getHint(
    @Body() body: { code: string; problemId: string; depth: string },
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    await this.aiService.streamHint(body, res);
  }

  @Post("complexity")
  analyzeComplexity(@Body() body: { code: string; language: string }) {
    return this.aiService.analyzeComplexity(body);
  }
}
