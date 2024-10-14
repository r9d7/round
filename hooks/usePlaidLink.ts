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
      // Assuming an actual auth implementations is in place, this check wouldn't be necessary here
      if (!session?.user) {
        return;
      }

      // onSuccess/onError needs to be handled in a real app
      await fetch("/api/v1/token/exchange", {
        method: "POST",
        body: JSON.stringify({ publicToken, user: session.user }),
      });
    },
    [session?.user]
  );

  // Need to handle `onError` in a production/real app
  return useReactPlaidLink({ token, onSuccess });
}
