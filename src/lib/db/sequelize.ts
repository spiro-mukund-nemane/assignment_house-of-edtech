import { Sequelize } from 'sequelize';
import { env } from '@/config/env';

// Next.js reloads modules on every request in dev, which would otherwise open
// a fresh Postgres connection pool each time. Caching the instance on
// globalThis keeps a single pool alive across those reloads.
const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

export const sequelize =
  globalForSequelize.sequelize ??
  new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'postgres',
    logging: env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions:
      env.NODE_ENV === 'production'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
  });

if (env.NODE_ENV === 'development') {
  globalForSequelize.sequelize = sequelize;
}
