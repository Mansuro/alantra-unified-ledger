/**
 * Integration Registry
 *
 * Central registry for all integration adapters. This pattern allows:
 * - Easy addition of new integrations without modifying core logic
 * - Runtime discovery of available integrations
 * - Type-safe access to adapters
 *
 * To add a new integration:
 * 1. Create the adapter in lib/integrations/adapters/
 * 2. Import and register it here
 */

import type { IntegrationAdapter, ProviderName, UnifiedTransaction } from "./types";
import { plaidAdapter } from "./adapters/plaid";
import { stripeAdapter } from "./adapters/stripe";

// Registry storage
const adapters = new Map<ProviderName, IntegrationAdapter>();

/**
 * Register an adapter in the registry.
 */
function registerAdapter(adapter: IntegrationAdapter): void {
  if (adapters.has(adapter.providerId)) {
    console.warn(`Adapter for ${adapter.providerId} is already registered. Overwriting.`);
  }
  adapters.set(adapter.providerId, adapter);
}

/**
 * Get an adapter by provider ID.
 */
export function getAdapter(providerId: ProviderName): IntegrationAdapter | undefined {
  return adapters.get(providerId);
}

/**
 * Get all registered adapters.
 */
export function getAllAdapters(): IntegrationAdapter[] {
  return Array.from(adapters.values());
}

/**
 * Get all registered provider IDs.
 */
export function getProviderIds(): ProviderName[] {
  return Array.from(adapters.keys());
}

/**
 * Check if a provider is registered.
 */
export function hasAdapter(providerId: ProviderName): boolean {
  return adapters.has(providerId);
}

/**
 * Data source with its raw data for normalization.
 */
export interface DataSource {
  providerId: ProviderName;
  data: unknown[];
}

/**
 * Normalize data from multiple sources using registered adapters.
 * This is the main entry point for normalizing transaction data.
 */
export function normalizeFromSources(sources: DataSource[]): UnifiedTransaction[] {
  const results: UnifiedTransaction[] = [];

  for (const source of sources) {
    const adapter = adapters.get(source.providerId);
    if (!adapter) {
      console.warn(`No adapter registered for provider: ${source.providerId}`);
      continue;
    }

    const normalized = adapter.normalize(source.data);
    results.push(...normalized);
  }

  // Sort by date descending (most recent first)
  results.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return results;
}

// ============================================================
// Register all adapters
// Add new adapters here as they're created
// ============================================================

registerAdapter(plaidAdapter);
registerAdapter(stripeAdapter);

// Future registrations:
// registerAdapter(paypalAdapter);
// registerAdapter(squareAdapter);
// registerAdapter(quickbooksAdapter);
// registerAdapter(xeroAdapter);
// etc.
