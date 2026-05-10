import { Injectable, NotFoundException } from "@nestjs/common";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import type { Problem } from "@ai-coding/types";

@Injectable()
export class ProblemsService {
  private readonly dataDir = join(__dirname, "../../../../../data/problems");
  private _cache: Problem[] | null = null;

  private async loadAll(): Promise<Problem[]> {
    if (this._cache) return this._cache;
    const files = await readdir(this.dataDir);
    const problems = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const raw = await readFile(join(this.dataDir, f), "utf-8");
          return JSON.parse(raw) as Problem;
        }),
    );
    this._cache = problems;
    return problems;
  }

  async findAll(filters: { difficulty?: string; tag?: string }): Promise<Problem[]> {
    const all = await this.loadAll();
    return all.filter((p) => {
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
      if (filters.tag && !p.patterns.includes(filters.tag as never)) return false;
      return true;
    });
  }

  async findBySlug(slug: string): Promise<Problem> {
    const all = await this.loadAll();
    const problem = all.find((p) => p.slug === slug);
    if (!problem) throw new NotFoundException(`Problem '${slug}' not found`);
    return problem;
  }
}
