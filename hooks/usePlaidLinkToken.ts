"use client";

import { useEffect, useState } from "react";

import { useSession } from "~/hooks/useSession";

import { getSession } from "~/lib/session";

export function usePlaidLinkToken() {
  const [token, setToken] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    async function getLinkToken(user: ReturnType<typeof getSession>["user"]) {
      const response = await fetch("/api/v1/token/link/create", {
        method: "POST",
        body: JSON.stringify({ user }),
      });
      const data = await response.json();

      setToken(data.linkToken);
    }

    if (session?.user && !token) {
      getLinkToken(session.user);
    }
  }, [session?.user, token]);

  return [token];
}
