/**
 * Shared utilities for integration adapters.
 */

import type { CategoryName } from "../mock-data";

/**
 * Infer a category from transaction description.
 * This is a simple keyword-based approach - could be enhanced with ML.
 */
export function inferCategory(description: string): CategoryName {
  const d = description.toLowerCase();

  if (d.includes("subscription")) return "Income";
  if (d.includes("aws") || d.includes("cloud")) return "Software";
  if (d.includes("rent")) return "Rent";
  if (d.includes("debt") || d.includes("funding")) return "Finance";

  return "Uncategorized";
}

/**
 * Convert dollars (float) to cents (bigint) safely via string round-trip.
 * This avoids JS floating-point errors better than Math.round(amount * 100).
 */
export function dollarsToCentsExact(amount: number): bigint {
  const s = amount.toFixed(2);
  const negative = s.startsWith("-");
  const [whole, frac] = (negative ? s.slice(1) : s).split(".");
  const cents = BigInt(whole) * 100n + BigInt(frac ?? "0");
  return negative ? -cents : cents;
}

/**
 * Format cents (bigint) to a display string like "$1,234.56" or "-$100.00"
 */
export function formatMoneyFromCents(amountCents: bigint): string {
  const negative = amountCents < 0n;
  const abs = negative ? -amountCents : amountCents;
  const dollars = abs / 100n;
  const cents = abs % 100n;

  // Add thousand separators
  const dollarsFormatted = dollars.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const s = `${dollarsFormatted}.${cents.toString().padStart(2, "0")}`;

  return negative ? `-$${s}` : `$${s}`;
}
