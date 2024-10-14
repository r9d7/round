"use client";

import { differenceInDays } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

import { usePlaidLink } from "~/hooks/usePlaidLink";
import { useSession } from "~/hooks/useSession";

import { accounts as accountsTable } from "~/lib/db/schema";
import { getSession } from "~/lib/session";
import { cn } from "~/lib/utils/common";

export default function Accounts() {
  const session = useSession();

  const { open, ready } = usePlaidLink();

  const [accounts, setAccounts] = useState<
    (typeof accountsTable.$inferSelect)[]
  >([]);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function getAccounts(user: ReturnType<typeof getSession>["user"]) {
      const response = await fetch(`/api/v1/accounts?user_id=${user.id}`);

      const data = await response.json();

      setAccounts(data);
    }

    if (session?.user && accounts.length === 0) {
      getAccounts(session.user);
    }
  }, [session?.user, accounts.length]);

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col grow-1 justify-center">
          <h1 className="text-3xl font-bold text-foreground-secondary">
            Accounts
          </h1>
          <span className="text-sm text-muted-foreground">
            Add or manage your linked bank accounts
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Icon.download.minimalistic.outline />
          </Button>

          <Button onClick={() => open()} disabled={!ready}>
            <Icon.add.circle.outline />
            <span className="ms-1">Link bank account</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between -mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Total account balance ({accounts.length + 1} account
              {accounts.length !== 1 ? "s" : ""})
            </span>

            <Icon.info.circle.outline />
          </div>
          <div>
            <div className="inline-flex text-2xl font-semibold border border-border rounded-md p-3">
              {Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "GBP", // Hardcoding this, skipping the currency selector dropdown
              }).format(
                accounts.reduce(
                  (acc, curr) =>
                    acc + (curr.currentBalance || curr.availableBalance || 0),
                  0
                )
              )}
            </div>
          </div>
        </div>

        {/* Adding for layout only, skipping the slider for now */}
        {accounts.length > 3 && (
          <div className="space-x-2">
            <Button variant="outline" size="icon">
              <Icon.arrow.alt.left.outline />
            </Button>
            <Button variant="outline" size="icon">
              <Icon.arrow.alt.right.outline />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* I wanted to work on the slider initially but I'm already over time. Sorry for the ugly .slice here */}
        {accounts.slice(0, 3).map((account) => (
          <div key={account.id} className="card flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 aspect-square rounded-full bg-foreground-secondary/50 shrink-0" />
              <span className="font-medium truncate">{account.name}</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground-secondary">
                {Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency:
                    account.isoCurrencyCode ||
                    account.unofficialCurrencyCodes ||
                    "GBP",
                }).format(
                  account.currentBalance || account.availableBalance || -1 // Defaulting to -1 to save time. Ideally we'd always have a value for `balance`
                )}
              </h2>
              {account.plaidSubType === "checking" && account.mask && (
                <div className="text-sm text-muted-foreground">
                  Checking Account (**{account.mask})
                </div>
              )}
              {account.lastSyncedAt &&
                differenceInDays(new Date(), account.lastSyncedAt) > 1 && (
                  <div className="text-sm text-muted-foreground flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Icon.refresh.outline className="text-xs" />{" "}
                      {differenceInDays(new Date(), account.lastSyncedAt)} days
                      ago
                    </div>

                    <Icon.menu.dots.bold className="text-foreground-secondary" />
                  </div>
                )}
            </div>
          </div>
        ))}

        <div
          onClick={ready ? () => open() : undefined}
          className={cn(
            "card flex flex-col items-center justify-center gap-2",
            ready ? "cursor-pointer" : "opacity-50"
          )}
        >
          <div className="flex items-center gap-2 text-foreground-secondary font-semibold">
            <Icon.add.circle.outline />
            <span>Link bank account</span>
          </div>
          <span className="text-sm">Click to link another bank account</span>
        </div>
      </div>

      {/* TODO */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card">runway & cash zero</div>
        <div className="card">monthly spend</div>
        <div className="card">monthly income</div>
      </div>

      <div className="card space-y-2">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            Date
          </Button>
          <Button variant="outline" disabled>
            Account
          </Button>
          <Button variant="outline" disabled>
            To/From
          </Button>
        </div>
        <p className="text-2xl">Transactions table</p>
      </div>
    </div>
  );
}
