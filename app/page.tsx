import { prisma, initializeDb } from "@/lib/prisma";
import { detectDateRangeMismatch, formatMoneyFromCents } from "@/lib/normalize";
import KpiCards from "@/components/kpi-cards";
import LedgerTable from "@/components/ledger-table";
import { AlertTriangle, Sparkles } from "lucide-react";

// Force dynamic rendering - database not available at build time
export const dynamic = "force-dynamic";

export default async function Page() {
  // Initialize database on cold start (Vercel serverless)
  await initializeDb();

  // Single-org MVP
  const org = await prisma.organization.findFirst({ where: { name: "Demo Org" } });
  if (!org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-8">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-zinc-900">Unified Ledger MVP</h1>
          <p className="mt-2 text-zinc-600">
            Database not seeded. Run these commands:
          </p>
          <div className="mt-4 space-y-2">
            <code className="block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-zinc-100">
              npm run prisma:migrate
            </code>
            <code className="block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-zinc-100">
              npm run db:seed
            </code>
          </div>
        </div>
      </div>
    );
  }

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { organizationId: org.id },
      include: { category: true, connection: true },
      orderBy: { occurredAt: "desc" }
    }),
    prisma.category.findMany({
      where: { organizationId: org.id },
      orderBy: { name: "asc" }
    })
  ]);

  // Compute KPIs with exact cents math on server
  const availableCents = transactions
    .filter((t) => t.status === "posted")
    .reduce((acc, t) => acc + t.amountCents, 0n);

  const pendingCents = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, t) => acc + t.amountCents, 0n);

  const projectedCents = availableCents + pendingCents;

  // Detect mismatch warning (trust signal)
  const unifiedLike = transactions.map((t) => ({
    source: t.provider === "PLAID" ? ("PLAID" as const) : ("STRIPE" as const),
    occurredAt: t.occurredAt
  }));
  const mismatch = detectDateRangeMismatch(
    unifiedLike.map((x) => ({
      source: x.source,
      occurredAt: x.occurredAt,
      externalId: "",
      status: "posted",
      description: "",
      amountCents: 0n,
      currency: "USD",
      inferredCategory: "Uncategorized",
      raw: {}
    }))
  );

  const rows = transactions.map((t) => ({
    id: t.id,
    date: t.occurredAt,
    description: t.description,
    source: t.provider,
    status: t.status,
    amountCents: t.amountCents,
    categoryId: t.categoryId,
    categoryName: t.category?.name ?? null
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-100">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-violet-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-emerald-200 opacity-30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100 opacity-20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                Unified Ledger
              </h1>
              <p className="mt-1 text-zinc-500">
                Multi-source financial data in one place
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Plaid Connected
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Stripe Connected
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Real-time Sync
            </span>
          </div>
        </div>

        {/* Warning Banner */}
        {mismatch && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg shadow-amber-100/50">
            <div className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/30">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Data Range Mismatch</h3>
                <p className="mt-1 text-sm text-amber-700">
                  Source date ranges don&apos;t align. This may affect data completeness.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <div className="rounded-lg bg-white/60 px-3 py-1.5 text-amber-800">
                    <span className="font-medium">Plaid:</span> {mismatch.plaid.min.toISOString().slice(0, 10)} → {mismatch.plaid.max.toISOString().slice(0, 10)}
                  </div>
                  <div className="rounded-lg bg-white/60 px-3 py-1.5 text-amber-800">
                    <span className="font-medium">Stripe:</span> {mismatch.stripe.min.toISOString().slice(0, 10)} → {mismatch.stripe.max.toISOString().slice(0, 10)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-10">
          <KpiCards
            available={formatMoneyFromCents(availableCents)}
            pending={formatMoneyFromCents(pendingCents)}
            projected={formatMoneyFromCents(projectedCents)}
          />
        </div>

        {/* Ledger Table */}
        <LedgerTable organizationId={org.id} rows={rows} categories={categories} />

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-zinc-400">
          Built with Next.js, Prisma, and TailwindCSS
        </div>
      </div>
    </div>
  );
}
