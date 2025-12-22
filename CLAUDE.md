# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unified Ledger MVP - A financial dashboard that consolidates transactions from multiple sources (Plaid for banking, Stripe for payments) into a single normalized view with KPI calculations and category management.

## Development Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run lint             # Run ESLint
npm run prisma:migrate   # Run database migrations
npm run prisma:generate  # Generate Prisma client after schema changes
npm run db:seed          # Seed database with mock data (uses tsx lib/seed.ts)
```

**Initial setup:**
```bash
npm install
npm run prisma:migrate
npm run db:seed
npm run dev
```

## Tech Stack

- **Framework:** Next.js 15 with App Router, React 19, TypeScript
- **Database:** SQLite with Prisma ORM v7
- **UI:** TailwindCSS 4 + shadcn/ui (New York style) + Radix UI primitives
- **Notifications:** Sonner for toast messages

## Architecture

### Data Flow
1. Server components fetch data from Prisma (app/page.tsx)
2. Server actions handle mutations (app/actions.ts with "use server")
3. Client components use optimistic updates with rollback on error

### Multi-Source Normalization
- Plaid (banking) and Stripe (payments) transactions unified into single format
- `lib/normalize.ts` contains normalization logic and the `UnifiedTransaction` type
- Each provider has its own enum value and raw payload preserved in `rawPayload` JSON field

### Financial Precision
- All amounts stored as `amountCents` (BigInt) to avoid floating-point errors
- Use `dollarsToCentsExact()` for conversion (string-based, not multiplication)
- Use `formatMoneyFromCents()` for display formatting

### Multi-Tenant Design
- All data scoped by `organizationId`
- Currently single-org MVP with hard-coded "Demo Org"
- Server actions must validate organization access

### Key Files
- `lib/prisma.ts` - Shared Prisma client with better-sqlite3 adapter
- `lib/normalize.ts` - Transaction normalization, currency utilities, category inference
- `lib/mock-data.ts` - Test fixtures for Plaid/Stripe transactions
- `app/actions.ts` - Server actions for category updates
- `components/ledger-table.tsx` - Main transaction table with sorting
- `components/category-cell.tsx` - Inline category editing with optimistic updates

## Database (Prisma 7)

**Schema:** Four main tables: Organization → IntegrationConnection → Transaction, plus Category
- Transactions have unique constraint on (connectionId, externalId)
- Categories have unique constraint on (organizationId, name)

**Prisma 7 Configuration:**
- `prisma/prisma.config.ts` - Migration config with better-sqlite3 adapter
- `lib/prisma.ts` - Shared PrismaClient instance with adapter (import from here, not `@prisma/client`)
- Schema has no `url` in datasource (Prisma 7 requirement) - connection configured via adapter

## shadcn/ui Components

Located in `components/ui/`. To add new components, use:
```bash
npx shadcn@latest add <component-name>
```

Path alias `@/*` maps to project root for imports.
