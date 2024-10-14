import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

import { dbClient } from "~/lib/db";

import { stats, transactions } from "~/lib/db/schema";

import { getAccountBalance } from "~/lib/utils/common";

import { env } from "~/env";

export async function GET(request: Request) {
  // In a real app we need to verify that the request is from the cron job (using a secret header because Vercel automatically will add this header to cron job requests. Just need to set a value in our .env)
  // if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const linkedItems = await dbClient.query.linkedItems.findMany({
      with: { accounts: true },
    });

    for (const linkedItem of linkedItems) {
      // Sync transactions if needed
      await fetch(`${env.NEXT_PUBLIC_URL}/api/v1/transactions/sync`, {
        method: "POST",
        body: JSON.stringify({ userId: linkedItem.userId }),
      });

      // Calculate stats for current & previous month since the cron will run daily this should be enough to stay updated
      const now = new Date();
      const monthsToUpdate = [
        { start: startOfMonth(now), end: now },
        {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1)),
        },
      ];

      for (const { start, end } of monthsToUpdate) {
        const monthlyStatsResult = await dbClient.query.transactions.findMany({
          where: and(
            eq(transactions.userId, linkedItem.userId),
            gte(transactions.dateTime, start),
            lt(transactions.dateTime, end)
          ),
          columns: { amount: true },
        });

        // The inline `?? 0` is ugly but it's harmless here
        const monthlyIn = monthlyStatsResult.reduce(
          (sum, t) => (t.amount ?? 0 < 0 ? sum + Math.abs(t.amount ?? 0) : sum),
          0
        );
        const monthlyOut = monthlyStatsResult.reduce(
          (sum, t) => (t.amount ?? 0 > 0 ? sum + (t.amount ?? 0) : sum),
          0
        );

        // Calculate runway (assuming totalOut is negative)
        const totalBalance = linkedItem.accounts.reduce(
          (acc, curr) => acc + getAccountBalance(curr),
          0
        );

        const monthlyNet = monthlyIn - monthlyOut;
        const runwayDays =
          monthlyNet <= 0 ? 0 : (totalBalance / monthlyNet) * 30;

        await dbClient
          .insert(stats)
          .values({
            userId: linkedItem.userId,

            monthlyIn,
            monthlyOut,
            runwayDays,

            lastCalculated: new Date(),
          })
          .onConflictDoUpdate({
            target: [stats.userId],
            set: {
              monthlyIn,
              monthlyOut,
              runwayDays,
              lastCalculated: new Date(),
            },
          });

        await dbClient
          .insert(stats)
          .values({
            userId: linkedItem.userId,

            monthlyIn,
            monthlyOut,
            runwayDays,

            lastCalculated: now,
          })
          // ! Turns out this is an open bug in drizzle-orm where a composite unique constraint
          // ! can't be used as the `target` in a `onConflictDoUpdate`, even though this is the correct approach drizzle will crash
          // ! https://github.com/drizzle-team/drizzle-orm/issues/2645
          // ! Sadly this cron won't work until this is fixed
          .onConflictDoUpdate({
            target: [stats.userId, stats.createdAt],
            set: {
              monthlyIn,
              monthlyOut,
              runwayDays,

              lastCalculated: now,
            },
          });
      }
    }

    return Response.json({ message: "Monthly stats updated" });
  } catch (err) {
    return Response.json(
      { error: "Failed to update monthly stats" },
      { status: 500 }
    );
  }
}
