/**
 * Core types for the integration adapter system.
 *
 * To add a new integration:
 * 1. Add the provider name to the ProviderName type
 * 2. Create a new adapter file in lib/integrations/adapters/
 * 3. Implement the IntegrationAdapter interface
 * 4. Register the adapter in lib/integrations/registry.ts
 */

import type { CategoryName } from "../mock-data";

// Extensible provider type - add new providers here
export type ProviderName = "PLAID" | "STRIPE";

// Unified transaction format that all integrations normalize to
export interface UnifiedTransaction {
  source: ProviderName;
  externalId: string;
  occurredAt: Date;
  status: "posted" | "pending";
  description: string;
  amountCents: bigint;
  currency: string;
  inferredCategory: CategoryName;
  raw: unknown;
}

// Base interface that all integration adapters must implement
export interface IntegrationAdapter<TRawData = unknown> {
  /** Unique identifier for this provider */
  readonly providerId: ProviderName;

  /** Human-readable name */
  readonly displayName: string;

  /** Normalize raw provider data into unified transactions */
  normalize(rawData: TRawData[]): UnifiedTransaction[];
}

// Configuration for an integration
export interface IntegrationConfig {
  enabled: boolean;
  // Add more config options as needed (API keys, etc.)
}

// Metadata about a date range for a source
export interface DateRange {
  min: Date;
  max: Date;
}

// Result of date range analysis across sources
export interface DateRangeMismatch {
  sources: Map<ProviderName, DateRange>;
  hasOverlap: boolean;
}
