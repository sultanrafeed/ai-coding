import { Injectable } from "@nestjs/common";
import type { Submission, SubmissionStatus, Language } from "@ai-coding/types";
import { ProblemsService } from "../problems/problems.service";

const JUDGE0_URL = process.env.JUDGE0_URL ?? "http://localhost:2358";
const JUDGE0_AUTH = process.env.JUDGE0_AUTH_TOKEN ?? "";

const LANGUAGE_IDS: Record<Language, number> = {
  python: 71,
  cpp: 54,
  javascript: 63,
};

// Judge0 status id → our status
function mapStatus(id: number): SubmissionStatus {
  if (id === 1) return "pending";
  if (id === 2) return "running";
  if (id === 3) return "accepted";
  if (id === 4) return "wrong_answer";
  if (id === 5) return "time_limit_exceeded";
  if (id === 6) return "compile_error";
  return "runtime_error";
}

@Injectable()
export class SubmissionsService {
  constructor(private readonly problemsService: ProblemsService) {}

  async create(payload: { problemId: string; code: string; language: string }): Promise<Pick<Submission, "id" | "status" | "createdAt">> {
    const lang = payload.language as Language;
    const languageId = LANGUAGE_IDS[lang] ?? 71;

    // Grab the first non-hidden test case as stdin, if available
    let stdin = "";
    try {
      const problem = await this.problemsService.findBySlug(payload.problemId);
      const tc = problem.testCases.find((t) => !t.isHidden);
      if (tc) stdin = tc.input;
    } catch {
      // problem not found — proceed without stdin
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (JUDGE0_AUTH) headers["X-Auth-Token"] = JUDGE0_AUTH;

    const resp = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers,
      body: JSON.stringify({ source_code: payload.code, language_id: languageId, stdin }),
    });

    const { token } = (await resp.json()) as { token: string };
    return { id: token, status: "pending", createdAt: new Date().toISOString() };
  }

  async findOne(id: string): Promise<Partial<Submission>> {
    const headers: Record<string, string> = {};
    if (JUDGE0_AUTH) headers["X-Auth-Token"] = JUDGE0_AUTH;

    const resp = await fetch(`${JUDGE0_URL}/submissions/${id}?base64_encoded=false`, { headers });
    const data = (await resp.json()) as {
      status: { id: number };
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      time: string | null;
      memory: number | null;
    };

    const status = mapStatus(data.status.id);
    return {
      id,
      status,
      result: {
        passedTests: status === "accepted" ? 1 : 0,
        totalTests: 1,
        runtime: data.time ? Math.round(parseFloat(data.time) * 1000) : undefined,
        memory: data.memory ?? undefined,
        stderr: data.stderr ?? data.compile_output ?? undefined,
      },
    };
  }
}
