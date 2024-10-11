import { CountryCode, Products } from "plaid";

import { plaidClient } from "~/lib/plaid";
import { getSession } from "~/lib/session";

import { env } from "~/env";

export async function POST(request: Request) {
  const { user } = (await request.json()) as {
    user: ReturnType<typeof getSession>["user"];
  };

  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: user.id },
    client_name: "Round Finance App",
    products: env.PLAID_PRODUCTS.split(",") as Products[],
    language: "en",
    country_codes: env.PLAID_COUNTRY_CODES.split(",") as CountryCode[],
  });

  return Response.json({ linkToken: response.data.link_token });
}
