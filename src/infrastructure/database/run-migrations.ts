import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const useSsl = process.env.DB_SSL === 'true';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/typeorm/entities/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  connectTimeout: 15000,
  ...(useSsl && { ssl: { rejectUnauthorized: true } }),
});

async function run(): Promise<void> {
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
  console.log('Migrations completed.');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
