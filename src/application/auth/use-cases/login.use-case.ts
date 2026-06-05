import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IUserRepository } from '@domain/user/repositories/user.repository.interface';
import { IRefreshTokenRepository } from '@domain/auth/repositories/refresh-token.repository.interface';
import { IPasswordHasher } from '@application/ports/password-hasher.port';
import { ITokenIssuer } from '@application/ports/token-issuer.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';
import { AppErrors } from '@application/exceptions/application.exception';
import { TokenPair } from '@shared/types/pagination';
import {
  USER_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_ISSUER,
  PERMISSION_CACHE,
} from '@shared/constants/tokens';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: IRefreshTokenRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_ISSUER) private readonly tokens: ITokenIssuer,
    @Inject(PERMISSION_CACHE)
    private readonly permissionCache: IPermissionCache,
    private readonly config: ConfigService,
  ) {}

  async execute(email: string, password: string): Promise<TokenPair> {
    const user = await this.users.findByEmailWithRolesAndPermissions(email);
    if (!user) throw AppErrors.UNAUTHORIZED('Invalid email or password.');

    const valid = await this.hasher.compare(password, user.passwordHash);
    if (!valid) throw AppErrors.UNAUTHORIZED('Invalid email or password.');

    const ttl = this.config.get<number>('PERMISSION_CACHE_TTL_SEC', 60);
    await this.permissionCache.set(
      user.id,
      {
        roleNames: user.roleNames,
        permissionCodes: user.permissionCodes,
      },
      ttl,
    );

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: number, email: string): Promise<TokenPair> {
    const issued = await this.tokens.issuePair(userId, email);
    const tokenHash = crypto
      .createHash('sha256')
      .update(issued.refreshToken)
      .digest('hex');
    await this.refreshTokens.save(userId, tokenHash, issued.refreshExpiresAt);
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      expiresIn: issued.accessExpiresIn,
    };
  }
}
