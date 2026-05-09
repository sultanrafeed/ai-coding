import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id/profile")
  getProfile(@Param("id") id: string) {
    return this.usersService.getProfile(id);
  }

  @Get(":id/skill-graph")
  getSkillGraph(@Param("id") id: string) {
    return this.usersService.getSkillGraph(id);
  }
}
