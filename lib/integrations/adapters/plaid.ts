/**
 * Plaid Integration Adapter
 *
 * Normalizes Plaid bank transaction data into the unified format.
 */

import type { IntegrationAdapter, UnifiedTransaction } from "../types";
import { dollarsToCentsExact, inferCategory } from "../utils";

// Shape of raw Plaid transaction data
export interface PlaidTransaction {
  id: string;
  amount: number;
  direction: "inbound" | "outbound";
  date: string;
  description: string;
}

export const plaidAdapter: IntegrationAdapter<PlaidTransaction> = {
  providerId: "PLAID",
  displayName: "Plaid Banking",

  normalize(rawData: PlaidTransaction[]): UnifiedTransaction[] {
    return rawData.map((t) => {
      const occurredAt = new Date(t.date);
      const baseCents = dollarsToCentsExact(t.amount);
      const signedCents = t.direction === "inbound" ? baseCents : -baseCents;

      return {
        source: "PLAID",
        externalId: t.id,
        occurredAt,
        status: "posted", // Plaid transactions are always posted
        description: t.description,
        amountCents: signedCents,
        currency: "USD",
        inferredCategory: inferCategory(t.description),
        raw: t
      };
    });
  }
};
