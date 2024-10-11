import { pgTable, serial } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),

  // userId:

  // accountName: Optionally store a different account name for Round only
  // accoutId
  // accountType

  // balance
  // currency

  // lastSyncedAt

  // createdAt
});
