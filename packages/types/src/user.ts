export interface User {
  id: string;
  clerkId: string;
  email: string;
  username?: string;
  createdAt: string;
}

export interface SkillNode {
  tag: string;
  score: number;
  problemsAttempted: number;
  problemsSolved: number;
}

export interface SkillGraph {
  userId: string;
  nodes: SkillNode[];
  updatedAt: string;
}
