import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = registerAs('database', () => {
  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'lead_ms',

    entities: [join(__dirname, '..', 'modules', '**', '*.entity{.ts,.js}')],

    // Migration configuration
    migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
    migrationsTableName: 'migrations',

    synchronize:
      process.env.NODE_ENV?.trim() === 'development' &&
      process.env.DB_SYNCHRONIZE === 'true',

    // Logging
    logging: process.env.NODE_ENV?.trim() === 'development',

    // Connection
    ssl:
      process.env.DB_SSL === 'true'
        ? {
            rejectUnauthorized: false,
          }
        : undefined,

    // Performance
    cache: process.env.NODE_ENV?.trim() === 'production',

    // Auto load migrations
    migrationsRun: process.env.NODE_ENV?.trim() === 'production',
  };

  return config;
});
