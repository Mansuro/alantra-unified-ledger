/**
 * Stripe Integration Adapter
 *
 * Normalizes Stripe charge/payment data into the unified format.
 */

import type { IntegrationAdapter, UnifiedTransaction } from "../types";
import { inferCategory } from "../utils";

// Shape of raw Stripe charge data
export interface StripeCharge {
  id: string;
  amount: number; // in cents
  status: "pending" | "succeeded" | "failed";
  created: number; // Unix timestamp in seconds
  description: string;
}

export const stripeAdapter: IntegrationAdapter<StripeCharge> = {
  providerId: "STRIPE",
  displayName: "Stripe Payments",

  normalize(rawData: StripeCharge[]): UnifiedTransaction[] {
    return rawData
      .filter((c) => c.status !== "failed") // Exclude failed charges
      .map((c) => {
        const occurredAt = new Date(c.created * 1000);
        const status = c.status === "pending" ? "pending" : "posted";

        return {
          source: "STRIPE",
          externalId: c.id,
          occurredAt,
          status,
          description: c.description,
          amountCents: BigInt(c.amount), // Stripe amounts are already in cents
          currency: "USD",
          inferredCategory: inferCategory(c.description),
          raw: c
        };
      });
  }
};
