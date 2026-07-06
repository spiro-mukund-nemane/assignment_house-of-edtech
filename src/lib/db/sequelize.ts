import { Sequelize } from 'sequelize';
import { env } from '@/config/env';

// Next.js reloads modules on every request in dev, which would otherwise open
// a fresh Postgres connection pool each time. Caching the instance on
// globalThis keeps a single pool alive across those reloads.
const globalForSequelize = globalThis as unknown as { sequelize?: Sequelize };

// Neon (and most managed Postgres) require TLS on every connection, not just
// in production — a local dev box talking to a local Postgres install does not.
const sslDialectOptions = { ssl: { require: true, rejectUnauthorized: false } };

function createSequelize() {
  const shared = {
    dialect: 'postgres' as const,
    logging: env.NODE_ENV === 'development' ? console.log : false,
    // Serverless functions are short-lived, and each invocation can open its
    // own pool — a large max would exhaust Neon's connection limit under load.
    ...(env.NODE_ENV === 'production' ? { pool: { max: 3, min: 0, idle: 10_000 } } : {}),
  };

  if (env.DATABASE_URL) {
    return new Sequelize(env.DATABASE_URL, { ...shared, dialectOptions: sslDialectOptions });
  }

  return new Sequelize(env.DB_NAME!, env.DB_USER!, env.DB_PASSWORD!, {
    ...shared,
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialectOptions: env.NODE_ENV === 'production' ? sslDialectOptions : undefined,
  });
}

export const sequelize = globalForSequelize.sequelize ?? createSequelize();

if (env.NODE_ENV === 'development') {
  globalForSequelize.sequelize = sequelize;
}
