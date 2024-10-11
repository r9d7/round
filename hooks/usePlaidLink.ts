import { useCallback } from "react";
import {
  PlaidLinkOnSuccess,
  usePlaidLink as useReactPlaidLink,
} from "react-plaid-link";

import { usePlaidLinkToken } from "~/hooks/usePlaidLinkToken";
import { useSession } from "~/hooks/useSession";

export function usePlaidLink() {
  const session = useSession();
  const [token] = usePlaidLinkToken();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken) => {
      // TODO: Add comment abt short circuiting here
      if (!session?.user) {
        return;
      }

      const response = await fetch("/api/v1/token/exchange", {
        method: "POST",
        body: JSON.stringify({ publicToken, user: session.user }),
      });
      const data = await response.json();

      console.log(">>>", data); // TODO: REMEMBER TO REMOVE
    },
    [session?.user]
  );

  return useReactPlaidLink({ token, onSuccess });
}
