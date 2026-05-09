import { Injectable } from "@nestjs/common";
import type { Response } from "express";

@Injectable()
export class AiService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  async streamExplainError(
    _payload: { code: string; error: string; problemId: string },
    _res: Response,
  ) {
    // TODO: forward to Python AI service as SSE stream
  }

  async streamHint(
    _payload: { code: string; problemId: string; depth: string },
    _res: Response,
  ) {
    // TODO: forward to Python AI service as SSE stream
  }

  async analyzeComplexity(_payload: { code: string; language: string }) {
    // TODO: call Python AI service complexity endpoint
  }
}
