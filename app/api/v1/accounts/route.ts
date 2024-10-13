import { parseISO } from "date-fns/parseISO";
import { eq } from "drizzle-orm";
import { AccountBase } from "plaid";

import { dbClient } from "~/lib/db";
import { accounts, linkedItems } from "~/lib/db/schema";

export async function POST(request: Request) {
  const { linkedItemId, accounts: accountsPayload } =
    (await request.json()) as {
      linkedItemId: (typeof linkedItems.$inferSelect)["id"];
      accounts: AccountBase[];
    };

  const matchingLinkedItem = await dbClient.query.linkedItems.findFirst({
    where: eq(linkedItems.id, linkedItemId),
  });

  if (!matchingLinkedItem) {
    return Response.json(
      { error: `Item with ID ${linkedItemId} not found` },
      { status: 404 }
    );
  }

  const newAccounts = await dbClient
    .insert(accounts)
    .values(
      accountsPayload
        // Only store accounts that have an available or current balance
        // Ignoring accounts with a `limit` to avoid complexity now
        .filter(
          (account) => account.balances.available || account.balances.current
        )
        .map((account) => ({
          userId: matchingLinkedItem.userId,
          linkedItemId,

          name: account.name,
          mask: account.mask,

          plaidAccountId: account.account_id,
          plaidType: account.type,
          plaidSubType: account.subtype,
          plaidOfficialName: account.official_name,

          availableBalance: account.balances.available,
          currentBalance: account.balances.current,

          isoCurrencyCode: account.balances.iso_currency_code,
          unofficialCurrencyCodes: account.balances.unofficial_currency_code,

          lastSyncedAt: account.balances.last_updated_datetime
            ? parseISO(account.balances.last_updated_datetime)
            : new Date(),
        }))
    )
    .returning();

  return Response.json(newAccounts);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return Response.json({ error: "User ID is required" }, { status: 400 });
  }

  const matchingLinkedItems = await dbClient.query.linkedItems.findMany({
    where: eq(linkedItems.userId, userId),
    with: { accounts: true },
  });

  return Response.json(matchingLinkedItems.map((i) => i.accounts).flat());
}
