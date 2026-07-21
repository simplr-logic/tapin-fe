# deploy

Local environment config for this app.

```bash
cp deploy/.env.example deploy/.env
```

`GATEWAY_URL` — base URL of the running `simplr.klong-be` gateway (defaults
to `http://localhost:8080`). Read by `next.config.ts` (rewrites) and
server-side gateway calls (`src/lib/gateway.ts`, typed via `src/config/env.ts`).

`npm run dev` / `npm run start` load this file via `dotenv-cli` — it is
**not** the Next.js default `.env.local` at the project root, and `deploy/.env`
is gitignored (only `.env.example` is tracked).

Vercel deploys don't use this file — production env vars are set directly in
the Vercel project dashboard.
