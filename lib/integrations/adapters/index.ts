/**
 * Export all adapters from a single entry point.
 *
 * When adding a new integration:
 * 1. Create the adapter file (e.g., paypal.ts)
 * 2. Export it here
 * 3. Register it in ../registry.ts
 */

export { plaidAdapter, type PlaidTransaction } from "./plaid";
export { stripeAdapter, type StripeCharge } from "./stripe";

// Future adapters would be exported here:
// export { paypalAdapter, type PayPalTransaction } from "./paypal";
// export { squareAdapter, type SquareTransaction } from "./square";
// export { quickbooksAdapter, type QuickBooksTransaction } from "./quickbooks";
