export type Language = "python" | "cpp" | "javascript";

export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compile_error";

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: Language;
  status: SubmissionStatus;
  result?: SubmissionResult;
  createdAt: string;
}

export interface SubmissionResult {
  passedTests: number;
  totalTests: number;
  runtime?: number;
  memory?: number;
  stderr?: string;
}
