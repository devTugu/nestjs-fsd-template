import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const createTypeOrmOptions = (
  configService: ConfigService,
): DataSourceOptions => {
  const useSsl = configService.get<string>('DB_SSL') === 'true';
  const connectionLimit = configService.get<number>('DB_CONNECTION_LIMIT', 10);

  return {
    type: 'mysql',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.getOrThrow<string>('DB_PORT')),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    entities: [__dirname + '/../database/typeorm/entities/*{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    connectTimeout: 15000,
    extra: { connectionLimit },
    ...(useSsl && { ssl: { rejectUnauthorized: true } }),
  };
};
