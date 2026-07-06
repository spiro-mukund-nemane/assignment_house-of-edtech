require('dotenv').config({ quiet: true });

// Plain CommonJS config for sequelize-cli, which can't load TypeScript.
// The app itself connects through src/lib/db/sequelize.ts, not this file.
const sslDialectOptions = { ssl: { require: true, rejectUnauthorized: false } };

// DATABASE_URL (Neon/Vercel) takes priority over the discrete DB_* vars
// (local Postgres). Neon requires TLS regardless of which "environment"
// name sequelize-cli is invoked with.
const useConnectionUrl = Boolean(process.env.DATABASE_URL);

const base = useConnectionUrl
  ? { use_env_variable: 'DATABASE_URL', dialect: 'postgres', dialectOptions: sslDialectOptions }
  : {
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
    };

module.exports = {
  development: { ...base },
  test: {
    ...base,
    ...(useConnectionUrl ? {} : { database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test` }),
  },
  production: { ...base, dialectOptions: sslDialectOptions },
};
