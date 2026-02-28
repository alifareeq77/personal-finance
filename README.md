# Personal Finance Tracker

Mobile-first personal finance app (Next.js App Router, TypeScript, Tailwind, Prisma). Optimized for iPhone Safari and slow networks.

## Features

- **Quick Add Expense**: Enter amount (IQD), tap Save. Source defaults to last used.
- **Deposit / Withdraw**: Choose source, amount; optional FX in Advanced accordion.
- **Sources**: CRUD + archive (Settings).
- **Debts**: On Hold (receivable) and Out (payable); settle; view totals.
- **Monthly expenses**: Configure templates; "Apply for this month" with confirmation and idempotency.

## Run locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Database (SQLite by default)**
   ```bash
   echo 'DATABASE_URL="file:./dev.db"' > .env
   npx prisma db push
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Production (Postgres)

Set `DATABASE_URL` to your Postgres connection string and run:

```bash
npx prisma db push
# or
npx prisma migrate deploy
```

Then build and start:

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` — development server
- `npm run build` — Prisma generate + Next.js build
- `npm start` — production server
- `npm run db:push` — push schema (SQLite/Postgres)
- `npm run db:migrate` — run migrations (Prisma Migrate)

## Data

- **Currency**: IQD only; amounts stored as integers.
- **Single-user**: No auth by default; data layer is ready for auth later.
- **Local storage**: `lastUsedSourceId` for Quick Add default source.

## PWA

The app is Add-to-Home-Screen friendly (manifest, viewport, theme-color). Optional: add a service worker for offline caching.
