import { Controller, Post, Get, Param, Body, UseGuards } from "@nestjs/common";
import { SubmissionsService } from "./submissions.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("submissions")
@UseGuards(JwtAuthGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() body: { problemId: string; code: string; language: string }) {
    return this.submissionsService.create(body);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.submissionsService.findOne(id);
  }
}
