import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  RefreshToken,
  AuditLog,
} from './database/typeorm/entities';
import {
  USER_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  ROLE_REPOSITORY,
  PERMISSION_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_ISSUER,
  TOKEN_BLACKLIST,
  PERMISSION_CACHE,
  AUDIT_LOG_REPOSITORY,
} from '@shared/constants/tokens';
import { UserTypeOrmRepository } from './repositories/user.typeorm-repository';
import { RefreshTokenTypeOrmRepository } from './repositories/refresh-token.typeorm-repository';
import { RoleTypeOrmRepository } from './repositories/role.typeorm-repository';
import { PermissionTypeOrmRepository } from './repositories/permission.typeorm-repository';
import { AuditLogTypeOrmRepository } from './repositories/audit-log.typeorm-repository';
import { BcryptPasswordHasher } from './auth/bcrypt-password-hasher';
import { JwtTokenIssuerAdapter } from './auth/jwt-token-issuer.adapter';
import { RedisClient } from './cache/redis/redis.client';
import { TokenBlacklistRedisAdapter } from './cache/redis/token-blacklist.redis-adapter';
import { PermissionCacheRedisAdapter } from './cache/redis/permission-cache.redis-adapter';
import { TokenBlacklistMemoryAdapter } from './cache/memory/token-blacklist.memory-adapter';
import { PermissionCacheMemoryAdapter } from './cache/memory/permission-cache.memory-adapter';
import { RedisHealthIndicator } from './cache/redis/redis.health';
import { isRedisEnabled } from './config/redis.config';
import { ITokenBlacklist } from '@application/ports/token-blacklist.port';
import { IPermissionCache } from '@application/ports/permission-cache.port';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserRole,
      RolePermission,
      RefreshToken,
      AuditLog,
    ]),
  ],
  providers: [
    {
      provide: RedisClient,
      useFactory: (config: ConfigService) => {
        if (!isRedisEnabled(config)) return null;
        return new RedisClient(config);
      },
      inject: [ConfigService],
    },
    RedisHealthIndicator,
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenTypeOrmRepository,
    },
    { provide: ROLE_REPOSITORY, useClass: RoleTypeOrmRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionTypeOrmRepository },
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogTypeOrmRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_ISSUER, useClass: JwtTokenIssuerAdapter },
    {
      provide: TOKEN_BLACKLIST,
      useFactory: (
        config: ConfigService,
        redis: RedisClient | null,
      ): ITokenBlacklist => {
        if (isRedisEnabled(config) && redis) {
          return new TokenBlacklistRedisAdapter(redis);
        }
        return new TokenBlacklistMemoryAdapter();
      },
      inject: [ConfigService, RedisClient],
    },
    {
      provide: PERMISSION_CACHE,
      useFactory: (
        config: ConfigService,
        redis: RedisClient | null,
      ): IPermissionCache => {
        if (isRedisEnabled(config) && redis) {
          return new PermissionCacheRedisAdapter(redis);
        }
        return new PermissionCacheMemoryAdapter();
      },
      inject: [ConfigService, RedisClient],
    },
  ],
  exports: [
    JwtModule,
    TypeOrmModule,
    RedisClient,
    RedisHealthIndicator,
    USER_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    ROLE_REPOSITORY,
    PERMISSION_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    PASSWORD_HASHER,
    TOKEN_ISSUER,
    TOKEN_BLACKLIST,
    PERMISSION_CACHE,
  ],
})
export class InfrastructureModule {}
