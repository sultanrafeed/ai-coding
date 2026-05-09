export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  descriptionHtml: string;
  tags: string[];
  constraints: Record<string, unknown>;
  examples: Example[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}
