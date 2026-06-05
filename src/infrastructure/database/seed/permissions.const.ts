/** RBAC permission codes used by seed and PermissionsGuard. */
export const PERMISSION_CODES = [
  'USER_READ',
  'USER_CREATE',
  'USER_UPDATE',
  'USER_DELETE',
  'ROLE_READ',
  'ROLE_CREATE',
  'ROLE_UPDATE',
  'ROLE_DELETE',
  'PERMISSION_READ',
  'PERMISSION_CREATE',
  'PERMISSION_UPDATE',
  'PERMISSION_DELETE',
] as const;

export const SUPER_ADMIN_ROLE_NAME = 'SUPER_ADMIN';
