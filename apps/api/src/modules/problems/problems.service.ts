import { Injectable, NotFoundException } from "@nestjs/common";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { Problem } from "@ai-coding/types";

@Injectable()
export class ProblemsService {
  private problems: Map<string, Problem> | null = null;

  private loadProblems(): Map<string, Problem> {
    if (this.problems) return this.problems;

    this.problems = new Map();
    const problemsDir = join(__dirname, "../../../../../data/problems");

    try {
      const files = readdirSync(problemsDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const content = readFileSync(join(problemsDir, file), "utf-8");
          const problem = JSON.parse(content) as Problem;
          this.problems.set(problem.slug, problem);
        }
      }
    } catch (error) {
      console.error("Failed to load problems:", error);
    }

    return this.problems;
  }

  async findAll(filters: { difficulty?: string; tag?: string }): Promise<Problem[]> {
    const problemsMap = this.loadProblems();
    let results = Array.from(problemsMap.values());

    if (filters.difficulty) {
      results = results.filter((p) => p.difficulty === filters.difficulty);
    }
    if (filters.tag) {
      results = results.filter((p) => p.patterns?.includes(filters.tag as any));
    }

    return results;
  }

  async findBySlug(slug: string): Promise<Problem> {
    const problemsMap = this.loadProblems();
    const problem = problemsMap.get(slug);

    if (!problem) {
      throw new NotFoundException(`Problem '${slug}' not found`);
    }

    return problem;
  }
}
