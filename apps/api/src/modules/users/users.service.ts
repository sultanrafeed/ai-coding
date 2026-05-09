import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  async getProfile(_userId: string) {
    // TODO: fetch user + submission history from Postgres
  }

  async getSkillGraph(_userId: string) {
    // TODO: aggregate skill assessments into graph nodes
  }
}
