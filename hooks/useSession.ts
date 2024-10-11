"use client";

import { getSession } from "~/lib/session";

// Dummy mock "hook" to emulate next-auth
export function useSession(): ReturnType<typeof getSession> | null {
  return getSession();
}
