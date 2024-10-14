import { format } from "date-fns/format";
import { subDays } from "date-fns/subDays";
import { eq, lt } from "drizzle-orm";

import { dbClient } from "~/lib/db";
import { accounts, linkedItems, transactions } from "~/lib/db/schema";
import { plaidClient } from "~/lib/plaid";
import { getSession } from "~/lib/session";

const DATE_FILTER_FORMAT = "yyyy-MM-dd";

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as {
      userId: ReturnType<typeof getSession>["user"]["id"];
    };

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const now = new Date();

    const matchingLinkedItems = await dbClient.query.linkedItems.findMany({
      where: eq(linkedItems.userId, userId),
      with: {
        accounts: {
          // Only return accounts that have been synced more than 1 day ago
          where: lt(accounts.lastSyncedAt, subDays(now, 1)),
          columns: { lastSyncedAt: true },
        },
      },
    });

    if (!matchingLinkedItems.length) {
      return Response.json({ error: "No items need to be synced" });
    }

    const linkedItemsToSync = matchingLinkedItems.filter((linkedItem) =>
      Boolean(linkedItem.accounts.length)
    );

    const startDate = format(subDays(now, 30), DATE_FILTER_FORMAT); // Checking transactions for last 30 days in case some were updated
    const endDate = format(now, DATE_FILTER_FORMAT);

    const batchSize = 25; // Only for the purpose of the demo. A number around 500 would make more sense but should be adjusted based on the system it runs on & the needs
    const transactionsSyncedForAccounts = new Set<number>();

    for (const linkedItem of linkedItemsToSync) {
      let offset = 0;
      let totalTransactions = 1; // Init to 1 to ensure the while loop runs at least once

      while (offset < totalTransactions) {
        const response = await plaidClient.transactionsGet({
          access_token: linkedItem.plaidAccessToken,
          start_date: startDate,
          end_date: endDate,
          options: { count: batchSize, offset },
        });

        const transactionsData = response.data.transactions;
        // totalTransactions = response.data.total_transactions;
        totalTransactions = 25; // Limiting for the purpose of the demo

        for (const transaction of transactionsData) {
          // This lookup for every transaction is not ideal and could be avoided
          // But I'm rolling with it now to save time
          const matchingAccount = await dbClient.query.accounts.findFirst({
            where: eq(accounts.plaidAccountId, transaction.account_id),
          });

          if (!matchingAccount) {
            // Skipping updating a transaction if can't find an account to link to
            // Ideally a real world app would keep track of these & schedule a retry for later
            // While notifying the user some transactions weren't synced
            continue;
          }

          await dbClient
            .insert(transactions)
            .values({
              userId,
              accountId: matchingAccount.id,

              plaidTransactionId: transaction.transaction_id,

              amount: transaction.amount,

              isoCurrencyCode: transaction.iso_currency_code,
              unofficialCurrencyCodes: transaction.unofficial_currency_code,

              checkNumber: transaction.check_number,

              dateTime: transaction.datetime
                ? new Date(transaction.datetime)
                : null,

              transactionCode: transaction.transaction_code,
              merchantName: transaction.merchant_name,

              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: transactions.plaidTransactionId,
              set: {
                // Only updating a couple of fields for the demo
                amount: transaction.amount,
                dateTime: transaction.datetime
                  ? new Date(transaction.datetime)
                  : null,
              },
            });

          transactionsSyncedForAccounts.add(matchingAccount.id);
        }

        offset += transactionsData.length;
      }
    }

    for (const accountId of Array.from(transactionsSyncedForAccounts.keys())) {
      await dbClient
        .update(accounts)
        .set({ lastSyncedAt: new Date() })
        .where(eq(accounts.id, accountId));
    }

    return Response.json({ message: "Transactions synced successfully" });
  } catch (err) {
    return Response.json(null, { status: 500 });
  }
}
