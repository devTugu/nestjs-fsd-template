import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitRbac1730000000000 implements MigrationInterface {
  name = 'InitRbac1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL DEFAULT NULL,
        UNIQUE KEY \`UQ_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`roles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` varchar(255) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) NULL DEFAULT NULL,
        UNIQUE KEY \`UQ_roles_name\` (\`name\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`permissions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`code\` varchar(255) NOT NULL,
        \`description\` varchar(255) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY \`UQ_permissions_code\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`user_roles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`role_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE KEY \`UQ_user_roles_user_role\` (\`user_id\`, \`role_id\`),
        PRIMARY KEY (\`id\`),
        KEY \`FK_user_roles_user\` (\`user_id\`),
        KEY \`FK_user_roles_role\` (\`role_id\`),
        CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`role_permissions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`role_id\` int NOT NULL,
        \`permission_id\` int NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE KEY \`UQ_role_permissions_role_perm\` (\`role_id\`, \`permission_id\`),
        PRIMARY KEY (\`id\`),
        KEY \`FK_role_permissions_role\` (\`role_id\`),
        KEY \`FK_role_permissions_permission\` (\`permission_id\`),
        CONSTRAINT \`FK_role_permissions_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_role_permissions_permission\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`refresh_tokens\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`token_hash\` varchar(255) NOT NULL,
        \`expires_at\` timestamp NOT NULL,
        \`revoked_at\` timestamp NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`FK_refresh_tokens_user\` (\`user_id\`),
        CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `refresh_tokens`');
    await queryRunner.query('DROP TABLE IF EXISTS `role_permissions`');
    await queryRunner.query('DROP TABLE IF EXISTS `user_roles`');
    await queryRunner.query('DROP TABLE IF EXISTS `permissions`');
    await queryRunner.query('DROP TABLE IF EXISTS `roles`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
  }
}
