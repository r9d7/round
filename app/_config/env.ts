import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import envSchema from "env-schema";
import z from "zod";

const env = dotenv.config();

dotenvExpand.expand(env);

export const schema = z.object({
  // DB Config
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.number(),

  DATABASE_URL: z.string(),

  // Plaid Config
  PLAID_CLIENT_ID: z.string(),
  PLAID_SECRET: z.string(),

  PLAID_ENV: z.literal("sandbox"),

  PLAID_PRODUCTS: z.string(),
  PLAID_COUNTRY_CODES: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

envSchema({ schema });
