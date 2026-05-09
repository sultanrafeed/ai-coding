export type HintDepth = "socratic" | "conceptual" | "near-solution";

export interface HintRequest {
  code: string;
  problemId: string;
  depth: HintDepth;
  language: string;
}

export interface ComplexityResult {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  confidence: number;
}

export type AIInteractionType = "hint" | "explain_error" | "complexity" | "code_review";

export interface AIFeedback {
  interactionId: string;
  rating: 1 | -1;
}
