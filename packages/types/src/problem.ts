export type Difficulty = "easy" | "medium" | "hard";

export type AlgoPattern =
  | "array" | "hash-table" | "two-pointers" | "sliding-window"
  | "binary-search" | "sorting" | "stack" | "queue" | "linked-list"
  | "tree" | "graph" | "bfs" | "dfs" | "backtracking"
  | "dynamic-programming" | "greedy" | "divide-and-conquer"
  | "segment-tree" | "fenwick-tree" | "trie" | "union-find"
  | "heap" | "bit-manipulation" | "math" | "string";

export interface CanonicalSolution {
  language: string;
  code: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface Editorial {
  approach: string;
  explanation: string;
  keyInsight: string;
  commonMistakes: string[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  descriptionHtml: string;
  patterns: AlgoPattern[];
  constraints: Record<string, string>;
  examples: Example[];
  testCases: TestCase[];
  canonicalSolutions: CanonicalSolution[];
  editorial: Editorial;
}
