import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import {
  Role,
  Permission,
  User,
  UserRole,
  RolePermission,
  RefreshToken,
} from '../typeorm/entities';
import { PERMISSION_CODES, SUPER_ADMIN_ROLE_NAME } from './permissions.const';

dotenv.config({ path: '.env' });

const useSsl = process.env.DB_SSL === 'true';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Role, Permission, User, UserRole, RolePermission, RefreshToken],
  synchronize: false,
  connectTimeout: 15000,
  ...(useSsl && { ssl: { rejectUnauthorized: true } }),
});

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

async function runSeed(): Promise<void> {
  await dataSource.initialize();

  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const rolePermissionRepo = dataSource.getRepository(RolePermission);

  let superAdminRole = await roleRepo.findOne({
    where: { name: SUPER_ADMIN_ROLE_NAME },
  });
  if (!superAdminRole) {
    superAdminRole = await roleRepo.save(
      roleRepo.create({
        name: SUPER_ADMIN_ROLE_NAME,
        description: 'Super administrator with all permissions',
      }),
    );
    console.log('Created SUPER_ADMIN role');
  }

  for (const code of PERMISSION_CODES) {
    const existing = await permissionRepo.findOne({ where: { code } });
    if (!existing) {
      await permissionRepo.save(
        permissionRepo.create({ code, description: code }),
      );
      console.log('Created permission:', code);
    }
  }

  const allPerms = await permissionRepo.find();
  const existingRp = await rolePermissionRepo.find({
    where: { roleId: superAdminRole.id },
  });
  const existingPermIds = new Set(existingRp.map((rp) => rp.permissionId));
  for (const p of allPerms) {
    if (existingPermIds.has(p.id)) continue;
    await rolePermissionRepo.save(
      rolePermissionRepo.create({
        roleId: superAdminRole.id,
        permissionId: p.id,
      }),
    );
  }

  let adminUser = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    adminUser = await userRepo.save(
      userRepo.create({ email: ADMIN_EMAIL, passwordHash, isActive: true }),
    );
    console.log('Created admin user:', ADMIN_EMAIL);
  }

  const existingUr = await userRoleRepo.findOne({
    where: { userId: adminUser.id, roleId: superAdminRole.id },
  });
  if (!existingUr) {
    await userRoleRepo.save(
      userRoleRepo.create({ userId: adminUser.id, roleId: superAdminRole.id }),
    );
  }

  await dataSource.destroy();
  console.log('Seed completed.');
}

runSeed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
