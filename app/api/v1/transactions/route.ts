import { desc, eq } from "drizzle-orm";

import { dbClient } from "~/lib/db";
import { transactions } from "~/lib/db/schema";

// This endpoint needs filtering & pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Leaving this here because it could make sense to trigger an update
    // when a user is requesting their transactions, but:
    // 1. The `lastSyncAccount` is not necessary because there's checks when the /transactions/sync endpoint is called.
    // Although having the check here as well will save a bit of resources
    // 2. Ideally the /transactions/sync workflow would be async, built on something like Redis or RabbitMQ

    // const lastSyncAccount = await dbClient.query.accounts.findFirst({
    //   where: eq(accounts.userId, userId),
    //   columns: { lastSyncedAt: true },
    //   orderBy: [desc(accounts.lastSyncedAt)],
    // });

    // if (lastSyncAccount) {
    //   await fetch(`${env.NEXT_PUBLIC_URL}/api/v1/transactions/sync`, {
    //     method: "POST",
    //     body: JSON.stringify({ userId }),
    //   });
    // }

    const matchingTransactions = await dbClient.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: [desc(transactions.dateTime)],
      limit: 25,
    });

    return Response.json(matchingTransactions);
  } catch (err) {
    return Response.json(null, { status: 500 });
  }
}
