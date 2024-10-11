import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "~/lib/db/schema";

import dbConfig from "~/drizzle.config";
import { env } from "~/env";

declare global {
  var database: PostgresJsDatabase<typeof schema> | undefined;
}

let database: PostgresJsDatabase<typeof schema>;
let queryClient: ReturnType<typeof postgres>;

if (env.NODE_ENV === "production") {
  queryClient = postgres(dbConfig.dbCredentials.url);
  database = drizzle(queryClient, { schema });
} else {
  if (!global.database) {
    queryClient = postgres(dbConfig.dbCredentials.url);
    global.database = drizzle(queryClient, { schema });
  }
  database = global.database;
}

export { database, queryClient as pg };
