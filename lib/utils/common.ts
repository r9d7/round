import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { accounts } from "~/lib/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAccountBalance(account: typeof accounts.$inferSelect) {
  return account.currentBalance || account.availableBalance || 0;
}
