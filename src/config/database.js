require('dotenv').config({ quiet: true });

// Plain CommonJS config for sequelize-cli, which can't load TypeScript.
// The app itself connects through src/lib/db/sequelize.ts, not this file.
const common = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
};

module.exports = {
  development: { ...common },
  test: { ...common, database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test` },
  production: {
    ...common,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
};
