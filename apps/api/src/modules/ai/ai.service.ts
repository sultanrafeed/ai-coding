import { Injectable } from "@nestjs/common";
import type { Response } from "express";

@Injectable()
export class AiService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

  async streamExplainError(
    payload: { code: string; error: string; problemId: string },
    res: Response,
  ): Promise<void> {
    await this.forwardStream(
      `${this.aiServiceUrl}/ai/explain-error`,
      { code: payload.code, error: payload.error, problem_id: payload.problemId, language: "python" },
      res,
    );
  }

  async streamHint(
    payload: { code: string; problemId: string; depth: string },
    res: Response,
  ): Promise<void> {
    await this.forwardStream(
      `${this.aiServiceUrl}/ai/hint`,
      { code: payload.code, problem_id: payload.problemId, depth: payload.depth },
      res,
    );
  }

  async analyzeComplexity(payload: { code: string; language: string }): Promise<unknown> {
    const resp = await fetch(`${this.aiServiceUrl}/ai/complexity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return resp.json();
  }

  private async forwardStream(
    url: string,
    body: Record<string, string>,
    res: Response,
  ): Promise<void> {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const reader = upstream.body?.getReader();
    if (!reader) {
      res.end();
      return;
    }
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  }
}
