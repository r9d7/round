import { eq } from "drizzle-orm";

import { dbClient } from "~/lib/db";
import { linkedItems } from "~/lib/db/schema";

export async function POST(request: Request) {
  // TODO: Request payload needs to be validated against a schema
  // & should short circuit if there's no `item_id`
  const { webhook_type, webhook_code, item_id } = (await request.json()) as {
    webhook_type: string; // Ideally would be typed better
    webhook_code: string; // Same as above
    item_id?: string;
  };

  if (!item_id?.length) {
    return Response.json({ error: "Missing `item_id` param" }, { status: 400 });
  }

  if (webhook_type === "TRANSACTIONS" && webhook_code === "DEFAULT_UPDATE") {
    try {
      const matchingLinkedItem = await dbClient.query.linkedItems.findFirst({
        where: eq(linkedItems.plaidItemId, item_id),
      });

      if (matchingLinkedItem) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sync-transactions`,
          {
            method: "POST",
            body: JSON.stringify({ userId: matchingLinkedItem.userId }),
          }
        );
      }
    } catch (err) {
      // Shouldn't return an error response here because Plaid expects a 200 OK
      // even if we fail to process the webhook
      console.error("Error processing webhook:", err);
    }
  }

  return Response.json({ received: true });
}
