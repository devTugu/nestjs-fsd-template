import { User as DomainUser } from '@domain/user/entities/user.entity';
import { User as OrmUser } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: OrmUser, withAuth = false): DomainUser {
    const roleNames: string[] = [];
    const permissionCodes: string[] = [];

    if (withAuth && entity.userRoles) {
      for (const ur of entity.userRoles) {
        if (ur.role?.name) roleNames.push(ur.role.name);
        for (const rp of ur.role?.rolePermissions ?? []) {
          if (rp.permission?.code) permissionCodes.push(rp.permission.code);
        }
      }
    }

    return new DomainUser(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
      [...new Set(roleNames)],
      [...new Set(permissionCodes)],
    );
  }
}
