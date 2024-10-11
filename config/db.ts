import { type Config } from "drizzle-kit";

import { env } from "~/config/env";

export default {
  dialect: "postgresql",
  out: "./migrations",
  schema: "./lib/db/schema.ts",
  dbCredentials: { url: env.DATABASE_URL },
  verbose: true,
  strict: true,
} satisfies Config;
