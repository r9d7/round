import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { enum2pg } from "~/lib/utils/db";

export enum AccountType {
  Investment = "investment",
  Credit = "credit",
  Depository = "depository",
  Loan = "loan",
  Brokerage = "brokerage",
  Other = "other",
}

export var accountTypeEnum = pgEnum("account_type_enum", enum2pg(AccountType));

// export const users = pgTable("users", { ... });

// export const usersRelations = relations(users, ({ many }) => ({
//   linkedItems: many(linkedItems),
// }));

export const linkedItems = pgTable("linked_items", {
  id: serial("id").primaryKey(),

  // This would be the FK for the one-to-many relation for users->linkedItems
  // I've added a pseudo-code example but am skipping user related stuff
  userId: varchar("user_id").notNull(),

  plaidItemId: varchar("plaid_item_id").unique().notNull(),
  plaidAccessToken: varchar("plaid_access_token").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const linkedItemsRelations = relations(linkedItems, ({ many }) => ({
  // author: one(users, {
  //   fields: [linkedItems.userId],
  //   references: [users.id],
  // }),
  accounts: many(accounts),
}));

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),

  // FK for the one-to-many relation for users->accounts
  userId: varchar("user_id").notNull(),
  linkedItemId: integer("linked_item_id").notNull(),

  name: varchar("name").notNull(),
  mask: varchar("mask"),

  // This could potentially get out of sync
  // if plaid needs to update the account_id as described in their docs
  // and needs to be handled for a real app (maybe via a webhook)
  plaidAccountId: varchar("plaid_account_id").unique().notNull(),
  plaidType: accountTypeEnum("plaid_type").notNull(),
  // Ideally this would be a enum like the above
  plaidSubType: varchar("plaid_sub_type"),
  plaidOfficialName: varchar("plaid_official_name"),

  availableBalance: doublePrecision("available_balance"),
  currentBalance: doublePrecision("current_balance"),

  isoCurrencyCode: varchar("iso_currency_code"),
  unofficialCurrencyCodes: varchar("unofficial_currency_codes"),

  lastSyncedAt: timestamp("last_synced_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  linkedItem: one(linkedItems, {
    fields: [accounts.linkedItemId],
    references: [linkedItems.id],
  }),
  transactions: many(transactions),
}));

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),

  // FK for the one-to-many relation for users->transactions
  userId: varchar("user_id").notNull(),
  accountId: integer("account_id").notNull(),

  plaidTransactionId: varchar("plaid_transaction_id").unique().notNull(),

  amount: doublePrecision("amount"),
  checkNumber: varchar("check_number"),

  isoCurrencyCode: varchar("iso_currency_code"),
  unofficialCurrencyCodes: varchar("unofficial_currency_codes"),

  transactionCode: varchar("transaction_code"),
  merchantName: varchar("merchant_name"),

  // Plaid transaction timestamp
  dateTime: timestamp("date_time", { withTimezone: true }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));
