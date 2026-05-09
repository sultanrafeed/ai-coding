import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/auth/auth.module";
import { ProblemsModule } from "./modules/problems/problems.module";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { AiModule } from "./modules/ai/ai.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    AuthModule,
    ProblemsModule,
    SubmissionsModule,
    AiModule,
    UsersModule,
  ],
})
export class AppModule {}
