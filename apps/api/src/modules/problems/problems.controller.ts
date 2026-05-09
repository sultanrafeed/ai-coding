import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProblemsService } from "./problems.service";

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  findAll(@Query("difficulty") difficulty?: string, @Query("tag") tag?: string) {
    return this.problemsService.findAll({ difficulty, tag });
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.problemsService.findBySlug(slug);
  }
}
