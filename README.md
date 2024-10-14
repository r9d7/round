## How to run

1. Install dependencies via `pnpm install`
2. Spin up PG with `docker compose up`
   1. Run `pnpm db:push` to apply the db schema to PG
3. Run the next app `pnpm dev`

## Notes

- Mistakenly I opted out of the /src directory when creating the app and rolled with it, usually I prefer to have it
- I was planning on using react-table & react-query but I'd already spent more than I probably should've on the task so leaving the current naive implementation
- Big fan of https://github.com/trivago/prettier-plugin-sort-imports but skipped to save time
- UnoCSS is used instead of TailwindCSS but they are similar
- I'd add better error/loading handling in prod for the client app
- The backend endpoints need:
  - Auth middleware, the app assumes there's a valid session & does no checks in that aspect
  - The payload/params need to be validated & parsed against a schema
  - Better error handling as well: better error codes & logging
  - Pagination & filtering for endpoints such as GET /transactions, GET /accounts
- I didn't connect the webhook with Plaid to save time
- I couldn't properly test the stat sync endpoint for the cron job because of a bug within drizzle
- I went with API route handler instead of server functions to stay close to the idea of having separate apps, a backend app and a client app is closer to most real world apps. But I would've implemented this with server actions if I were doing it in my app, unless I were working in a monorepo with a fastify backend and solid.js frontend
- It would be good to refactor & split the transaction sync logic in a util fn to be able to
  - Manually trigger it when necessary (avoiding any lastSyncedAt checks)
  - Directly call the util function rather than making a POST fetch call to the endpoint from within another endpoint
- It was the first time I worked with Plaid and I'm sure I got most of the integration incorrectly
  - My DB design got a bit out of hand as I was learning more about Plaid & how they structure their data. Some table connections are not optimal and if I were to start again I'd rethink the design to apply what I learned

## If this were a real app

Besides the usual auth, rate limiting & security stuff:

- The integration with Plaid needs to be rock-solid & tested
- Besides the usual unit & integration tests, the crucial flows should be end-to-end tested thoroughly to have full confidence. If any of the current flows fail there should be a way to retrigger them manually
- For this demo the transaction sync & the stats calculation cron are synchronous and blocking. In a real app it would make sense to move them to an async queue, while also having a system in place to keep track of the running jobs so we could provide the user with granular information about specific transactions/accounts/stats being re-synced/calculated
- As already mentioned, pagination & filtering for the transactions would be a useful feature to add
- The UI is not responsive so it'd be a nice thing to add

// ON NEW ACC TRIGGER STAT RECALC
