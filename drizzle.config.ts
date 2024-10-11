import { defineConfig } from "drizzle-kit";

import { env } from "~/env";

export default defineConfig({
  dialect: "postgresql",
  out: "./migrations",
  schema: "./lib/db/schema.ts",
  dbCredentials: {
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,

    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
  },
  verbose: true,
  strict: true,
});
