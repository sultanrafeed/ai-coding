import { Injectable, NotFoundException } from "@nestjs/common";
import type { Problem } from "@ai-coding/types";

@Injectable()
export class ProblemsService {
  async findAll(_filters: { difficulty?: string; tag?: string }): Promise<Problem[]> {
    // TODO: query Postgres with filters
    return [];
  }

  async findBySlug(slug: string): Promise<Problem> {
    // TODO: query Postgres by slug
    throw new NotFoundException(`Problem '${slug}' not found`);
  }
}
