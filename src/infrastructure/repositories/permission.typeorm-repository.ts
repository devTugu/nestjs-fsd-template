import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { IPermissionRepository } from '@domain/authorization/repositories/permission.repository.interface';
import { Permission as DomainPermission } from '@domain/authorization/entities/permission.entity';
import { PaginatedResult } from '@shared/types/pagination';
import { Permission } from '../database/typeorm/entities/permission.entity';
import { PermissionMapper } from '../database/typeorm/mappers/role.mapper';

@Injectable()
export class PermissionTypeOrmRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  async create(code: string, description?: string): Promise<DomainPermission> {
    const saved = await this.repository.save(
      this.repository.create({ code, description }),
    );
    return PermissionMapper.toDomain(saved);
  }

  async findById(id: number): Promise<DomainPermission | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<DomainPermission>> {
    const [items, total] = await this.repository.findAndCount({
      order: { code: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map((item) => PermissionMapper.toDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, description?: string): Promise<DomainPermission> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    if (description !== undefined) entity.description = description;
    const saved = await this.repository.save(entity);
    return PermissionMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    const entity = await this.repository.findOneOrFail({ where: { id } });
    await this.repository.remove(entity);
  }

  async codeExists(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { code: code.toUpperCase() },
    });
    return count > 0;
  }

  async findByIds(ids: number[]): Promise<DomainPermission[]> {
    const entities = await this.repository.findBy({ id: In(ids) });
    return entities.map((entity) => PermissionMapper.toDomain(entity));
  }
}
