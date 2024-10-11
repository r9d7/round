import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "~/lib/db/schema";

import { env } from "~/env";

declare global {
  var dbClient: PostgresJsDatabase<typeof schema> | undefined;
}

let dbClient: PostgresJsDatabase<typeof schema>;
let queryClient: ReturnType<typeof postgres>;

const pgConnConfig = {
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,

  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
};

if (env.NODE_ENV === "production") {
  queryClient = postgres(pgConnConfig);
  dbClient = drizzle(queryClient, { schema });
} else {
  if (!global.dbClient) {
    queryClient = postgres(pgConnConfig);
    global.dbClient = drizzle(queryClient, { schema });
  }
  dbClient = global.dbClient;
}

export { dbClient, queryClient as pg };
