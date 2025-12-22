/**
 * Transaction Normalization Module
 *
 * This module provides the main entry point for normalizing transactions
 * from multiple financial integrations.
 *
 * The actual normalization logic lives in lib/integrations/ using the
 * adapter pattern for scalability.
 */

import { PLAID_TRANSACTIONS, STRIPE_CHARGES } from "./mock-data";
import {
  normalizeFromSources,
  formatMoneyFromCents as formatMoney,
  getProviderIds,
  type UnifiedTransaction,
  type ProviderName,
  type DateRange
} from "./integrations";

// Re-export types and utilities for backwards compatibility
export type { UnifiedTransaction, ProviderName };
export { formatMoney as formatMoneyFromCents };

/**
 * Normalize all mock data sources into unified transactions.
 * In production, this would fetch data from actual APIs.
 */
export function normalizeAll(): UnifiedTransaction[] {
  return normalizeFromSources([
    { providerId: "PLAID", data: PLAID_TRANSACTIONS as unknown as unknown[] },
    { providerId: "STRIPE", data: STRIPE_CHARGES as unknown as unknown[] }
  ]);
}

/**
 * Date range mismatch detection that scales to N providers.
 * Returns null if all sources have overlapping date ranges.
 */
export function detectDateRangeMismatch(
  txns: UnifiedTransaction[]
): Record<string, DateRange> | null {
  // Group transactions by source
  const bySource = new Map<ProviderName, UnifiedTransaction[]>();

  for (const txn of txns) {
    const existing = bySource.get(txn.source) ?? [];
    existing.push(txn);
    bySource.set(txn.source, existing);
  }

  // Need at least 2 sources to compare
  if (bySource.size < 2) return null;

  // Calculate date range for each source
  const ranges = new Map<ProviderName, DateRange>();

  for (const [source, transactions] of bySource) {
    if (transactions.length === 0) continue;

    const times = transactions.map((t) => t.occurredAt.getTime());
    ranges.set(source, {
      min: new Date(Math.min(...times)),
      max: new Date(Math.max(...times))
    });
  }

  // Check for year mismatches between sources
  const yearSets = new Map<ProviderName, Set<number>>();
  for (const [source] of ranges) {
    const years = new Set<number>();
    const txnsForSource = bySource.get(source) ?? [];
    for (const txn of txnsForSource) {
      years.add(txn.occurredAt.getUTCFullYear());
    }
    yearSets.set(source, years);
  }

  // Find if any source has years that others don't
  const allYears = new Set<number>();
  for (const years of yearSets.values()) {
    for (const y of years) allYears.add(y);
  }

  let hasMismatch = false;
  for (const years of yearSets.values()) {
    for (const y of allYears) {
      if (!years.has(y)) {
        hasMismatch = true;
        break;
      }
    }
    if (hasMismatch) break;
  }

  if (!hasMismatch) return null;

  // Convert to plain object for easier consumption
  const result: Record<string, DateRange> = {};
  for (const [source, range] of ranges) {
    result[source.toLowerCase()] = range;
  }

  return result;
}

/**
 * Get a summary of all available data sources.
 */
export function getDataSourceSummary(txns: UnifiedTransaction[]): {
  source: ProviderName;
  count: number;
  dateRange: DateRange | null;
}[] {
  const providers = getProviderIds();
  const summary = [];

  for (const providerId of providers) {
    const sourceTxns = txns.filter((t) => t.source === providerId);

    let dateRange: DateRange | null = null;
    if (sourceTxns.length > 0) {
      const times = sourceTxns.map((t) => t.occurredAt.getTime());
      dateRange = {
        min: new Date(Math.min(...times)),
        max: new Date(Math.max(...times))
      };
    }

    summary.push({
      source: providerId,
      count: sourceTxns.length,
      dateRange
    });
  }

  return summary;
}
