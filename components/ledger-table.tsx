"use client";

import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CategoryCell from "@/components/category-cell";
import { formatMoneyFromCents } from "@/lib/normalize";
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, FileText, Tag, Layers, Activity } from "lucide-react";
import type { Category } from "@prisma/client";

type Row = {
  id: string;
  date: Date;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  source: "PLAID" | "STRIPE";
  status: "posted" | "pending";
  amountCents: bigint;
};

type SortKey = "date" | "description" | "category" | "source" | "amount";

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-zinc-400" />;
  return direction === "asc"
    ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-violet-600" />
    : <ArrowDown className="ml-1 h-3.5 w-3.5 text-violet-600" />;
}

export default function LedgerTable({
  organizationId,
  rows,
  categories
}: {
  organizationId: string;
  rows: Row[];
  categories: Category[];
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [dir, setDir] = React.useState<"asc" | "desc">("desc");

  const sorted = React.useMemo(() => {
    const copy = [...rows];
    const mul = dir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      const cmpStr = (x: string, y: string) => x.localeCompare(y) * mul;

      switch (sortKey) {
        case "date":
          return (a.date.getTime() - b.date.getTime()) * mul;
        case "description":
          return cmpStr(a.description, b.description);
        case "category":
          return cmpStr(a.categoryName ?? "", b.categoryName ?? "");
        case "source":
          return cmpStr(a.source, b.source);
        case "amount":
          return Number((a.amountCents - b.amountCents) * BigInt(mul));
        default:
          return 0;
      }
    });

    return copy;
  }, [rows, sortKey, dir]);

  function toggleSort(next: SortKey) {
    if (next === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(next);
      setDir("desc");
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-200/50">
      {/* Header */}
      <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Transaction Ledger</h2>
            <p className="text-sm text-zinc-500">All transactions normalized from multiple sources</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50/50">
              <TableHead
                className="cursor-pointer select-none font-semibold text-zinc-700 transition-colors hover:text-violet-600"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-zinc-400" />
                  Date
                  <SortIcon active={sortKey === "date"} direction={dir} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-zinc-700 transition-colors hover:text-violet-600"
                onClick={() => toggleSort("description")}
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-zinc-400" />
                  Description
                  <SortIcon active={sortKey === "description"} direction={dir} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-zinc-700 transition-colors hover:text-violet-600"
                onClick={() => toggleSort("category")}
              >
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-zinc-400" />
                  Category
                  <SortIcon active={sortKey === "category"} direction={dir} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none font-semibold text-zinc-700 transition-colors hover:text-violet-600"
                onClick={() => toggleSort("source")}
              >
                <div className="flex items-center">
                  <Layers className="mr-2 h-4 w-4 text-zinc-400" />
                  Source
                  <SortIcon active={sortKey === "source"} direction={dir} />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-zinc-700">
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-zinc-400" />
                  Status
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right font-semibold text-zinc-700 transition-colors hover:text-violet-600"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  <SortIcon active={sortKey === "amount"} direction={dir} />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.map((r, idx) => (
              <TableRow
                key={r.id}
                className={`border-b border-zinc-50 transition-colors hover:bg-violet-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30'}`}
              >
                <TableCell className="whitespace-nowrap font-medium text-zinc-600">
                  {r.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </TableCell>

                <TableCell className="min-w-[280px]">
                  <span className="font-medium text-zinc-900">{r.description}</span>
                </TableCell>

                <TableCell>
                  <CategoryCell
                    organizationId={organizationId}
                    transactionId={r.id}
                    categoryId={r.categoryId}
                    categories={categories}
                  />
                </TableCell>

                <TableCell>
                  {r.source === "PLAID" ? (
                    <Badge className="border-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                      Plaid
                    </Badge>
                  ) : (
                    <Badge className="border-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm">
                      Stripe
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {r.status === "pending" ? (
                    <Badge className="border-0 bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">
                      Pending
                    </Badge>
                  ) : (
                    <Badge className="border-0 bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm">
                      Posted
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <span className={`text-lg font-bold tabular-nums ${
                    r.amountCents >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {formatMoneyFromCents(r.amountCents)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-6 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Showing <span className="font-semibold text-zinc-700">{rows.length}</span> transactions
          </span>
          <div className="flex items-center gap-2 text-zinc-500">
            <span>Sorted by</span>
            <Badge variant="outline" className="font-medium capitalize">
              {sortKey}
            </Badge>
            <span className="text-zinc-400">({dir === "asc" ? "ascending" : "descending"})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
