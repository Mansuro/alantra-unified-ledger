/**
 * Integration System - Main Entry Point
 *
 * This module provides a scalable way to handle multiple financial integrations.
 *
 * Architecture:
 * - types.ts: Core interfaces and types
 * - utils.ts: Shared utilities (currency conversion, category inference)
 * - registry.ts: Central registry for all adapters
 * - adapters/: Individual adapter implementations
 *
 * To add a new integration (e.g., PayPal):
 * 1. Add "PAYPAL" to ProviderName in types.ts
 * 2. Create lib/integrations/adapters/paypal.ts implementing IntegrationAdapter
 * 3. Export from adapters/index.ts
 * 4. Register in registry.ts: registerAdapter(paypalAdapter)
 *
 * That's it! No if-else chains needed.
 */

// Types
export type {
  ProviderName,
  UnifiedTransaction,
  IntegrationAdapter,
  IntegrationConfig,
  DateRange,
  DateRangeMismatch
} from "./types";

// Registry functions
export {
  getAdapter,
  getAllAdapters,
  getProviderIds,
  hasAdapter,
  normalizeFromSources,
  type DataSource
} from "./registry";

// Utilities
export {
  inferCategory,
  dollarsToCentsExact,
  formatMoneyFromCents
} from "./utils";

// Adapters (for direct use if needed)
export { plaidAdapter, type PlaidTransaction } from "./adapters/plaid";
export { stripeAdapter, type StripeCharge } from "./adapters/stripe";
