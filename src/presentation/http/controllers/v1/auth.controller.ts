import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { LoginUseCase } from '@application/auth/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@application/auth/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '@application/auth/use-cases/logout.use-case';
import { GetUserUseCase } from '@application/user/use-cases/get-user.use-case';
import { Public } from '../../decorators/public.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { LoginDto, RefreshDto } from '../../dto/v1/login.dto';
import { JwtPayload, TokenPair } from '@shared/types/pagination';

@ApiTags('Auth v1')
@Controller({ path: 'auth', version: '1' })
export class AuthV1Controller {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns access and refresh tokens.',
  })
  async login(@Body() dto: LoginDto): Promise<TokenPair> {
    return this.loginUseCase.execute(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshDto): Promise<TokenPair> {
    return this.refreshUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Req() req: Request, @Body() dto: RefreshDto): Promise<void> {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    await this.logoutUseCase.execute(accessToken, dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current user profile' })
  async me(@CurrentUser() user: JwtPayload): Promise<unknown> {
    return this.getUserUseCase.execute(user.sub);
  }
}
