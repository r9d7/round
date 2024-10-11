import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "~/lib/db/schema";

import { env } from "~/env";

declare global {
  var database: PostgresJsDatabase<typeof schema> | undefined;
}

let database: PostgresJsDatabase<typeof schema>;
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
  database = drizzle(queryClient, { schema });
} else {
  if (!global.database) {
    queryClient = postgres(pgConnConfig);
    global.database = drizzle(queryClient, { schema });
  }
  database = global.database;
}

export { database, queryClient as pg };
