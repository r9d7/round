import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    NODE_ENV: z.union([z.literal("development"), z.literal("production")]),

    // DB Config
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),

    DATABASE_HOST: z.string(),
    DATABASE_PORT: z
      .string()
      .min(4)
      .max(4)
      .transform((v) => parseInt(v, 10))
      .pipe(z.number()),

    // Plaid Config
    PLAID_CLIENT_ID: z.string(),
    PLAID_SECRET: z.string(),

    PLAID_ENV: z.literal("sandbox"),

    PLAID_PRODUCTS: z.string(),
    PLAID_COUNTRY_CODES: z.string(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // DB Config
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: process.env.POSTGRES_DB,

    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,

    // Plaid Config
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID,
    PLAID_SECRET: process.env.PLAID_SECRET,

    PLAID_ENV: process.env.PLAID_ENV,

    PLAID_PRODUCTS: process.env.PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES: process.env.PLAID_COUNTRY_CODES,
  },
});
