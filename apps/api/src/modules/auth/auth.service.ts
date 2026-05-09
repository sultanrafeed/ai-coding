import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  async validateClerkToken(_token: string) {
    // TODO: verify JWT against Clerk JWKS endpoint
  }

  async upsertUserFromClerk(_clerkPayload: unknown) {
    // TODO: create or update user record in Postgres
  }
}
