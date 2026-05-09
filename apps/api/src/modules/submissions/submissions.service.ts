import { Injectable } from "@nestjs/common";

@Injectable()
export class SubmissionsService {
  async create(_payload: { problemId: string; code: string; language: string }) {
    // TODO: enqueue to Redis Stream → Judge0 → store result
  }

  async findOne(_id: string) {
    // TODO: fetch submission + result from Postgres
  }
}
