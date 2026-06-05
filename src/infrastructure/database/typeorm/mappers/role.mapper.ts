import { Role as DomainRole } from '@domain/authorization/entities/role.entity';
import { Permission as DomainPermission } from '@domain/authorization/entities/permission.entity';
import { Role as OrmRole } from '../entities/role.entity';
import { Permission as OrmPermission } from '../entities/permission.entity';

export class RoleMapper {
  static toDomain(entity: OrmRole): DomainRole {
    const permissions =
      entity.rolePermissions?.map(
        (rp) =>
          new DomainPermission(
            rp.permission.id,
            rp.permission.code,
            rp.permission.description ?? null,
          ),
      ) ?? [];
    return new DomainRole(
      entity.id,
      entity.name,
      entity.description ?? null,
      permissions,
    );
  }
}

export class PermissionMapper {
  static toDomain(entity: OrmPermission): DomainPermission {
    return new DomainPermission(
      entity.id,
      entity.code,
      entity.description ?? null,
    );
  }
}
