import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthV1Controller } from '../controllers/v1/auth.controller';
import { LoginUseCase } from '@application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@application/auth/use-cases/logout.use-case';
import { GetUserUseCase } from '@application/user/use-cases/get-user.use-case';
import { LoadUserAuthContextUseCase } from '@application/user/use-cases/load-user-auth-context.use-case';
import { JwtStrategy } from '@infrastructure/auth/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthV1Controller],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetUserUseCase,
    LoadUserAuthContextUseCase,
    JwtStrategy,
  ],
})
export class AuthPresentationModule {}
