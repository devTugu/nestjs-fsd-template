import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  IRefreshTokenRepository,
  StoredRefreshToken,
} from '@domain/auth/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../database/typeorm/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenTypeOrmRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async save(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.repository.save(
      this.repository.create({ userId, tokenHash, expiresAt }),
    );
  }

  async findByUserAndHash(
    userId: number,
    tokenHash: string,
  ): Promise<StoredRefreshToken | null> {
    const entity = await this.repository.findOne({
      where: { userId, tokenHash },
    });
    return entity ? this.toStored(entity) : null;
  }

  async findByHash(tokenHash: string): Promise<StoredRefreshToken | null> {
    const entity = await this.repository.findOne({ where: { tokenHash } });
    return entity ? this.toStored(entity) : null;
  }

  async revokeById(id: number): Promise<void> {
    await this.repository.update(id, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.repository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private toStored(entity: RefreshToken): StoredRefreshToken {
    return {
      id: entity.id,
      userId: entity.userId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
    };
  }
}
