import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sequelize/pg use dynamic requires to load the dialect driver, which
  // Turbopack can't statically bundle — keep them external, loaded straight
  // from node_modules at runtime instead.
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],
};

export default nextConfig;
