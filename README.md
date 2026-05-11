# Plate — Science-Based Meal Planning

A deterministic, evidence-tracked meal-planning app built on Next.js 16, React 19, Drizzle ORM + Turso, TanStack Query v5, and Zustand.

## Quickstart

```bash
# 1. Install dependencies (yarn 4 PnP)
corepack enable
yarn install

# 2. Copy environment file
cp .env.example .env.local
# Edit .env.local with your Turso credentials

# 3. Generate & run DB migrations
yarn db:generate
yarn db:migrate

# 4. Seed reference data
yarn tsx scripts/seed-nutrients.ts
yarn tsx scripts/seed-reference-packs.ts

# 5. Start dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/today` cockpit.

## Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Development server |
| `yarn build` | Production build |
| `yarn lint` | Lint with oxlint |
| `yarn format` | Format with Prettier |
| `yarn format:check` | Check formatting |
| `yarn typecheck` | TypeScript type checking |
| `yarn test` | Run Vitest unit tests |
| `yarn test:watch` | Watch mode |
| `yarn e2e` | Playwright E2E tests |
| `yarn db:generate` | Generate Drizzle migrations |
| `yarn db:migrate` | Apply migrations |
| `yarn db:studio` | Open Drizzle Studio |

## Architecture

- **Next.js 16** App Router with React 19 + React Compiler
- **Drizzle ORM** + libSQL/Turso for persistence
- **Better-Auth** for authentication
- **Nutrition engine**: Revised Harris-Benedict BMR, Remer-Manz PRAL, 3-layer adequacy scoring
- **Bioavailability rules**: Fe+VitC synergy, tannin inhibition, mineral supplement timing, phytate load
- **Evidence tracking**: Deterministic SHA-256 hash for every calculation, evidence pack versioning

## Key Directories

```
src/
├── app/today/          # Today cockpit UI
├── app/onboarding/     # Onboarding wizard
├── app/api/            # API routes
├── lib/nutrition/      # Targets, PRAL, adequacy, confidence, scoring
├── lib/bioavailability/ # Rule engine + 5 rules
├── lib/units/          # Quantity value-object
├── lib/db/             # Drizzle schema + migrations
└── data/               # Nutrients + reference packs JSON
```
