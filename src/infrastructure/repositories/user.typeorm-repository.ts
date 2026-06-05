import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import {
  CreateUserData,
  IUserRepository,
  ListUsersQuery,
  UpdateUserData,
} from '@domain/user/repositories/user.repository.interface';
import { User as DomainUser } from '@domain/user/entities/user.entity';
import { PaginatedResult } from '@shared/types/pagination';
import { User } from '../database/typeorm/entities/user.entity';
import { UserMapper } from '../database/typeorm/mappers/user.mapper';

@Injectable()
export class UserTypeOrmRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<DomainUser> {
    const saved = await this.repository.save(
      this.repository.create({
        email: data.email,
        passwordHash: data.passwordHash,
        isActive: data.isActive,
      }),
    );
    return UserMapper.toDomain(saved);
  }

  async findById(id: number): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        userRoles: { role: { rolePermissions: { permission: true } } },
      },
    });
    return entity ? UserMapper.toDomain(entity, true) : null;
  }

  async findByEmail(email: string): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({
      where: { email: email.toLowerCase(), deletedAt: IsNull() },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmailWithRolesAndPermissions(
    email: string,
  ): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({
      where: {
        email: email.toLowerCase(),
        isActive: true,
        deletedAt: IsNull(),
      },
      relations: {
        userRoles: { role: { rolePermissions: { permission: true } } },
      },
    });
    return entity ? UserMapper.toDomain(entity, true) : null;
  }

  async findActiveById(id: number): Promise<DomainUser | null> {
    const entity = await this.repository.findOne({
      where: { id, isActive: true, deletedAt: IsNull() },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(query: ListUsersQuery): Promise<PaginatedResult<DomainUser>> {
    const { page = 1, limit = 20, search } = query;
    const [items, total] = await this.repository.findAndCount({
      where: search
        ? { email: ILike(`%${search}%`), deletedAt: IsNull() }
        : { deletedAt: IsNull() },
      relations: {
        userRoles: { role: { rolePermissions: { permission: true } } },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      items: items.map((u) => UserMapper.toDomain(u, true)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, data: UpdateUserData): Promise<DomainUser> {
    const entity = await this.repository.findOneOrFail({
      where: { id, deletedAt: IsNull() },
      relations: { userRoles: { role: true } },
    });
    if (data.passwordHash) entity.passwordHash = data.passwordHash;
    if (data.isActive !== undefined) entity.isActive = data.isActive;
    const saved = await this.repository.save(entity);
    return UserMapper.toDomain(saved, true);
  }

  async softDelete(id: number): Promise<void> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    await this.repository.softRemove(entity);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.toLowerCase() },
      withDeleted: true,
    });
    return count > 0;
  }
}
