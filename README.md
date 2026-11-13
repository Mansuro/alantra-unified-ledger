# Unified Ledger

A financial dashboard that consolidates transactions from multiple sources (Plaid, Stripe) into a single normalized view.

## Features

- **Multi-source normalization** - Plaid and Stripe transactions unified into a single format
- **Scalable adapter pattern** - Add new integrations without if-else chains
- **Optimistic UI** - Instant feedback with rollback on error
- **Financial precision** - BigInt cents to avoid floating-point errors
- **Multi-tenant ready** - All data scoped by organization

## Getting Started

```bash
npm install
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

Multi-tenant Prisma schema for storing financial data across organizations:

```prisma
// Organization is the tenant - all data is scoped to an org
model Organization {
  id           String                  @id @default(cuid())
  name         String
  createdAt    DateTime                @default(now())
  categories   Category[]
  connections  IntegrationConnection[]
  transactions Transaction[]
}

// Each connected account (bank, payment processor)
model IntegrationConnection {
  id                String       @id @default(cuid())
  organizationId    String
  provider          Provider     // PLAID, STRIPE, etc.
  externalAccountId String?      // Provider's account ID
  createdAt         DateTime     @default(now())

  organization Organization  @relation(fields: [organizationId], references: [id])
  transactions Transaction[]
}

// User-defined categories per organization
model Category {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  createdAt      DateTime @default(now())

  organization Organization  @relation(fields: [organizationId], references: [id])
  transactions Transaction[]

  @@unique([organizationId, name])  // No duplicate names per org
}

// Normalized transaction from any source
model Transaction {
  id             String   @id @default(cuid())
  organizationId String
  connectionId   String
  provider       Provider
  externalId     String       // Provider's transaction ID
  occurredAt     DateTime
  status         TxStatus     // posted | pending
  amountCents    BigInt       // Store cents, not dollars
  currency       String       @default("USD")
  description    String
  categoryId     String?      // Nullable = uncategorized
  rawPayload     Json         // Original provider response
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization Organization           @relation(fields: [organizationId], references: [id])
  connection   IntegrationConnection  @relation(fields: [connectionId], references: [id])
  category     Category?              @relation(fields: [categoryId], references: [id])

  @@unique([connectionId, externalId])    // No duplicate transactions per connection
  @@index([organizationId, occurredAt])   // Fast org + date queries
}

enum Provider {
  PLAID
  STRIPE
}

enum TxStatus {
  posted
  pending
}
```

### Entity Relationship Diagram

```
┌──────────────────┐
│   Organization   │
│──────────────────│
│ id               │
│ name             │
└────────┬─────────┘
         │ 1:N
    ┌────┴────┬────────────┐
    ▼         ▼            ▼
┌────────┐ ┌──────────┐ ┌────────────────────┐
│Category│ │Connection│ │    Transaction     │
│────────│ │──────────│ │────────────────────│
│ id     │ │ id       │ │ id                 │
│ name   │ │ provider │ │ externalId         │
│ orgId  │ │ orgId    │ │ amountCents (BigInt)│
└────┬───┘ └────┬─────┘ │ status             │
     │          │       │ categoryId (FK)?   │
     │          │       │ connectionId (FK)  │
     │          │       │ orgId (FK)         │
     └──────────┴───────┤ rawPayload (JSON)  │
         N:1            └────────────────────┘
```

### Multi-Tenant Isolation

Every query filters by `organizationId`:

```typescript
// Server Action validates org ownership
const txn = await prisma.transaction.findFirst({
  where: { id: transactionId, organizationId }  // Always scope by org
});
```

## Tech Stack

- **Framework:** Next.js 15, React 19, TypeScript
- **Database:** SQLite + Prisma 7 (libsql adapter for Vercel)
- **UI:** TailwindCSS 4, shadcn/ui, Radix UI
- **Notifications:** Sonner

## Architecture

### Adapter Registry Pattern

Add integrations without modifying core logic:

```
lib/integrations/
├── types.ts          # IntegrationAdapter interface
├── registry.ts       # Central Map<Provider, Adapter>
└── adapters/
    ├── plaid.ts      # Plaid → UnifiedTransaction
    └── stripe.ts     # Stripe → UnifiedTransaction
```

To add a new provider:
1. Add to `Provider` enum in schema
2. Create adapter implementing `IntegrationAdapter`
3. Register: `registerAdapter(newAdapter)`

### Server Actions

Mutations use Next.js Server Actions for type-safe RPC:

```typescript
// app/actions.ts
"use server";

export async function updateTransactionCategory({ orgId, txnId, categoryId }) {
  // Runs on server, called like a function from client
}
```

## Deployment

Configured for Vercel serverless with auto-seeding on cold start. Database lives in `/tmp/dev.db` (ephemeral).

For production, replace SQLite with:
- [Turso](https://turso.tech) (libSQL hosted)
- [Neon](https://neon.tech) (Postgres)
- [PlanetScale](https://planetscale.com) (MySQL)