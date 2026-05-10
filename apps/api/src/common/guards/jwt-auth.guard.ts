import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  override canActivate(context: ExecutionContext) {
    // Bypass JWT validation outside production until Clerk RS256 strategy is wired
    if (process.env.NODE_ENV !== "production") return true;
    return super.canActivate(context);
  }
}
