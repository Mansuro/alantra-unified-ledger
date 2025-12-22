// Source A: Plaid (Bank Account)
export const PLAID_TRANSACTIONS = [
  {
    id: "p_01",
    amount: 50000.0,
    direction: "inbound",
    date: "2025-12-15T10:00:00Z",
    description: "Venture Debt Funding"
  },
  {
    id: "p_02",
    amount: 1240.5,
    direction: "outbound",
    date: "2025-12-16T14:20:00Z",
    description: "AWS Cloud Services"
  },
  {
    id: "p_03",
    amount: 3500.0,
    direction: "outbound",
    date: "2025-12-17T09:00:00Z",
    description: "Office Rent"
  }
] as const;

// Source B: Stripe (Payment Processor)
export const STRIPE_CHARGES = [
  {
    id: "s_01",
    amount: 4900, // cents
    status: "succeeded",
    created: 1765795200, // unix seconds - 2025-12-15
    description: "Subscription - Acme Corp"
  },
  {
    id: "s_02",
    amount: 120000,
    status: "succeeded",
    created: 1765881600, // 2025-12-16
    description: "Subscription - Globex"
  },
  {
    id: "s_03",
    amount: 25000,
    status: "pending",
    created: 1765968000, // 2025-12-17
    description: "Subscription - Soylent Corp"
  }
] as const;

export const CATEGORIES = ["Software", "Income", "Rent", "Uncategorized", "Finance"] as const;
export type CategoryName = (typeof CATEGORIES)[number];
