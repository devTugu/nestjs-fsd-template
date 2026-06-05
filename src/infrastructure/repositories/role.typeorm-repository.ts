import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import {
  CreateRoleData,
  IRoleRepository,
  UpdateRoleData,
} from '@domain/authorization/repositories/role.repository.interface';
import { Role as DomainRole } from '@domain/authorization/entities/role.entity';
import { PaginatedResult } from '@shared/types/pagination';
import { Role } from '../database/typeorm/entities/role.entity';
import { Permission } from '../database/typeorm/entities/permission.entity';
import { UserRole } from '../database/typeorm/entities/user-role.entity';
import { RolePermission } from '../database/typeorm/entities/role-permission.entity';
import { RoleMapper } from '../database/typeorm/mappers/role.mapper';

@Injectable()
export class RoleTypeOrmRepository implements IRoleRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(data: CreateRoleData): Promise<DomainRole> {
    const role = await this.roleRepository.save(
      this.roleRepository.create({
        name: data.name.toUpperCase(),
        description: data.description,
      }),
    );
    if (data.permissionIds?.length) {
      await this.syncPermissions(role.id, data.permissionIds);
    }
    return this.findById(role.id) as Promise<DomainRole>;
  }

  async findById(id: number): Promise<DomainRole | null> {
    const entity = await this.roleRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { rolePermissions: { permission: true } },
    });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResult<DomainRole>> {
    const [items, total] = await this.roleRepository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: { rolePermissions: { permission: true } },
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map((item) => RoleMapper.toDomain(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, data: UpdateRoleData): Promise<DomainRole> {
    const entity = await this.roleRepository.findOneOrFail({
      where: { id, deletedAt: IsNull() },
    });
    if (data.description !== undefined) entity.description = data.description;
    await this.roleRepository.save(entity);
    return this.findById(id) as Promise<DomainRole>;
  }

  async softDelete(id: number): Promise<void> {
    const entity = await this.roleRepository.findOneOrFail({ where: { id } });
    await this.roleRepository.softRemove(entity);
  }

  async nameExists(name: string): Promise<boolean> {
    const count = await this.roleRepository.count({
      where: { name: name.toUpperCase() },
    });
    return count > 0;
  }

  async assignToUser(userId: number, roleId: number): Promise<void> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    if (existing) throw new Error('DUPLICATE_USER_ROLE');
    await this.userRoleRepository.save(
      this.userRoleRepository.create({ userId, roleId }),
    );
  }

  async removeFromUser(userId: number, roleId: number): Promise<void> {
    const userRole = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    if (!userRole) throw new Error('USER_ROLE_NOT_FOUND');
    await this.userRoleRepository.remove(userRole);
  }

  async syncPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    const perms = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });
    const records = perms.map((p) =>
      this.rolePermissionRepository.create({ roleId, permissionId: p.id }),
    );
    await this.rolePermissionRepository.save(records);
  }

  async clearPermissions(roleId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId });
  }

  async replacePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(RolePermission, { roleId });
      if (!permissionIds.length) return;
      const perms = await manager.findBy(Permission, { id: In(permissionIds) });
      const records = perms.map((p) =>
        manager.create(RolePermission, { roleId, permissionId: p.id }),
      );
      await manager.save(RolePermission, records);
    });
  }
}
