import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 does not read .env by itself, so load it here (if the file exists).
if (existsSync(".env")) process.loadEnvFile();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Changing the database structure (migrations) uses the direct connection.
    // The running app uses the pooled DATABASE_URL instead.
    url: process.env["DIRECT_URL"],
  },
});
