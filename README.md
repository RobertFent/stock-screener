# Stock Screener

A Next.js screener that surfaces trade candidates from a Postgres database
filled by a separate python scraper. The app lets a trader define, save and
share indicator based filters, browse the matching symbols in a sortable table
and inspect each candidate on a TradingView chart.

## Features

- **Screener** (`/stock-screener`) with price/volume/ADR%, RSI, IV, Williams %R,
  stochastic and moving average criteria
- **Filter presets** per team, with a default preset and a per plan quota
- **Sortable, searchable results table** with keyboard navigation
  (`↑` / `↓` move the selection) and a live match count
- **Shareable views**: the whole filter, sort, search and selected symbol are
  mirrored into the URL, so a screen can be bookmarked or sent to someone else
- **TradingView chart** with up to three selectable studies, remembered locally
- Marketing landing page, pricing page connected to Stripe Checkout
- Clerk authentication, subscription management through the Stripe customer
  portal, activity logging

## Tech stack

| Concern   | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | [Next.js](https://nextjs.org/) (App Router)           |
| Database  | [Postgres](https://www.postgresql.org/) (two of them) |
| ORM       | [Drizzle](https://orm.drizzle.team/)                  |
| Auth      | [Clerk](https://clerk.com/)                           |
| Payments  | [Stripe](https://stripe.com/)                         |
| UI        | [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS    |
| Tests     | Jest (unit), Cypress (e2e)                            |

### The two databases

| Env var                       | Contents                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| `POSTGRES_URL`                | App data: users, teams, filter presets, activity log         |
| `POSTGRES_URL_STOCK_ANALYSIS` | `stock_data`, written by the python scraper (read only here) |

## Running locally

```bash
pnpm install
cp .env.example .env     # then fill in the Clerk / Stripe / Resend secrets
docker compose up -d     # starts both Postgres instances
pnpm db:migrate          # app schema
pnpm db:seed             # Stripe products
pnpm db:seed:stocks      # generated stock data, see below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

`pnpm db:setup` can create the `.env` file interactively instead, and Stripe
webhooks can be forwarded with:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

For Clerk webhooks the local app has to be reachable from the internet:

```bash
ngrok http 3000
```

### Generated stock data for local development

The screener needs a populated `stock_data` table, which in production is the
python scraper's job. `pnpm db:seed:stocks` creates the table (plus the
`(ticker, date DESC)` index the screener query relies on) and fills it with
deterministic, realistic test data:

- ~150 symbols spread across `sp100`, `sp500` and `nasdaq100`
- a seeded random walk per symbol, with drift and a medium term cycle so trends
  and mean reversion both occur
- every indicator computed from that series with the same definitions the UI
  documents: EMA 20/50, MA 200, Wilder RSI 4/14, MACD 12/26/9, Williams %R 4/14,
  stochastic slow 14/3/3, ADR 7/14

Because the generator is seeded, two runs produce identical data — useful when
comparing screenshots or debugging a filter.

```bash
pnpm db:seed:stocks                 # 260 sessions per symbol
SEED_DAYS=60 pnpm db:seed:stocks    # quicker, but no MA 200 values
```

The script refuses to run against anything that does not look like a local
database. Set `SEED_FORCE_REMOTE=1` to override that (it truncates the table).

### Indexes on the stock analysis database

The screener query needs `idx_stock_data_ticker_date` on
`stock_data (ticker, date DESC)`. `pnpm db:seed:stocks` creates it locally; for
an existing database (production, or one the scraper already filled) use:

```bash
pnpm db:index:stocks
```

It builds the index `CONCURRENTLY`, so the scraper can keep writing while it
runs, and is safe to run repeatedly.

This deliberately is **not** a drizzle migration: `lib/db/migrations` targets the
_application_ database and drizzle wraps each migration in a transaction, which
`CREATE INDEX CONCURRENTLY` is not allowed to run inside.

## Quality gates

```bash
pnpm typecheck
pnpm lint
pnpm test                 # or pnpm test:with-coverage
pnpm cypress:headless
```

## Caching

`/stock-screener` renders from a cached query tagged `stocks-cache`. The scraper
invalidates it after writing a new batch:

```bash
curl -X POST https://yourapp.com/api/revalidate \
  -H "x-revalidate-secret: super-long-random-string"
```

## Going to production

### Stripe webhook

1. Create a webhook for the production environment in the Stripe dashboard.
2. Point it at `https://yourdomain.com/api/stripe/webhook`.
3. Subscribe to `checkout.session.completed` and `customer.subscription.updated`.

### Clerk webhook

Dashboard → your instance → `configure` → `Webhooks`, pointing at
`https://yourdomain.com/api/clerk`.

### PostHog

Follow the Next.js setup at `https://eu.posthog.com/`.

### Deploy

Push to GitHub, connect the repository to [Vercel](https://vercel.com/) and set
the environment variables:

| Variable                            | Notes                           |
| ----------------------------------- | ------------------------------- |
| `BASE_URL`                          | Production domain               |
| `POSTGRES_URL`                      | App database                    |
| `POSTGRES_URL_STOCK_ANALYSIS`       | Stock analysis database         |
| `AUTH_SECRET`                       | `openssl rand -base64 32`       |
| `REVALIDATE_SECRET`                 | `openssl rand -base64 32`       |
| `STRIPE_SECRET_KEY`                 | Live key                        |
| `STRIPE_WEBHOOK_SECRET`             | From the production webhook     |
| `CLERK_SECRET_KEY`                  | Live key                        |
| `CLERK_WEBHOOK_SECRET`              | From the production webhook     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Live key                        |
| `NEXT_PUBLIC_POSTHOG_KEY`           |                                 |
| `NEXT_PUBLIC_POSTHOG_HOST`          | e.g. `https://eu.i.posthog.com` |
| `RESEND_API_KEY`                    |                                 |

### Testing payments

Card `4242 4242 4242 4242`, any future expiry, any CVC.
