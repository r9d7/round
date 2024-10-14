import { dbClient } from "~/lib/db";
import { linkedItems } from "~/lib/db/schema";
import { plaidClient } from "~/lib/plaid";
import { getSession } from "~/lib/session";

import { env } from "~/env";

export async function POST(request: Request) {
  try {
    const { publicToken, user } = (await request.json()) as {
      publicToken: string;
      user: ReturnType<typeof getSession>["user"];
    };
    const tokenExchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const { access_token, item_id } = tokenExchangeResponse.data;

    const [newLinkedItem] = await dbClient
      .insert(linkedItems)
      .values({
        userId: user.id,

        plaidItemId: item_id,
        plaidAccessToken: access_token, // ! This should be hashed
      })
      .returning();

    const plaidAccountsResponse = await plaidClient.accountsGet({
      access_token,
    });

    await fetch(`${env.NEXT_PUBLIC_URL}/api/v1/accounts`, {
      method: "POST",
      body: JSON.stringify({
        linkedItemId: newLinkedItem.id,
        accounts: plaidAccountsResponse.data.accounts,
      }),
    });

    // Trigger initial transactions sync
    await fetch(`${env.NEXT_PUBLIC_URL}/api/v1/transactions/sync`, {
      method: "POST",
      body: JSON.stringify({ userId: user.id }),
    });

    return Response.json(null, { status: 200 });
  } catch (err) {
    return Response.json(null, { status: 500 });
  }
}
