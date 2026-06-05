import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds soft-delete columns and TypeORM index names.
 * InitRbac already creates updated_at — this migration must not re-add it.
 */
export class AddUpdatedAtDeletedAt1730000000001 implements MigrationInterface {
  name = 'AddUpdatedAtDeletedAt1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.addColumnIfMissing(queryRunner, 'users', 'deleted_at', {
      definition:
        '`deleted_at` datetime(6) NULL DEFAULT NULL AFTER `updated_at`',
    });

    await this.addColumnIfMissing(queryRunner, 'roles', 'deleted_at', {
      definition:
        '`deleted_at` datetime(6) NULL DEFAULT NULL AFTER `updated_at`',
    });

    await this.addIndexIfMissing(
      queryRunner,
      'users',
      'IDX_users_email',
      '`email`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'roles',
      'IDX_roles_name',
      '`name`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'permissions',
      'IDX_permissions_code',
      '`code`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'user_roles',
      'IDX_user_roles_user_id',
      '`user_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'user_roles',
      'IDX_user_roles_role_id',
      '`role_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'role_permissions',
      'IDX_role_permissions_role_id',
      '`role_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'role_permissions',
      'IDX_role_permissions_permission_id',
      '`permission_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'refresh_tokens',
      'IDX_refresh_tokens_user_id',
      '`user_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'refresh_tokens',
      'IDX_refresh_tokens_token_hash',
      '`token_hash`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN IF EXISTS `deleted_at`',
    );
    await queryRunner.query(
      'ALTER TABLE `roles` DROP COLUMN IF EXISTS `deleted_at`',
    );
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    options: { definition: string },
  ): Promise<void> {
    const exists = await this.columnExists(queryRunner, table, column);
    if (!exists) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` ADD COLUMN ${options.definition}`,
      );
    }
  }

  private async addIndexIfMissing(
    queryRunner: QueryRunner,
    table: string,
    indexName: string,
    columns: string,
  ): Promise<void> {
    const exists = await this.indexExists(queryRunner, table, indexName);
    if (!exists) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columns})`,
      );
    }
  }

  private async columnExists(
    queryRunner: QueryRunner,
    table: string,
    column: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    )) as Array<{ cnt: string }>;
    return Number(rows[0]?.cnt ?? 0) > 0;
  }

  private async indexExists(
    queryRunner: QueryRunner,
    table: string,
    indexName: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [table, indexName],
    )) as Array<{ cnt: string }>;
    return Number(rows[0]?.cnt ?? 0) > 0;
  }
}
