import { Configuration, PlaidApi } from "plaid";

import { env } from "~/env";

const configuration = new Configuration({
  basePath: env.PLAID_ENV,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID,
      "PLAID-SECRET": env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
