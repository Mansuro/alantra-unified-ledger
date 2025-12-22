import { Provider, TxStatus, PrismaClient } from "@prisma/client";
import { normalizeAll } from "./normalize";
import { CATEGORIES } from "./mock-data";

export async function seedDatabase(prisma: PrismaClient) {
  // Check if already seeded
  const existingOrg = await prisma.organization.findFirst({
    where: { name: "Demo Org" }
  });
  if (existingOrg) return;

  // Single org for MVP
  const org = await prisma.organization.create({
    data: { name: "Demo Org" }
  });

  // Create connections
  const plaidConn = await prisma.integrationConnection.create({
    data: {
      id: "plaid-demo-conn",
      organizationId: org.id,
      provider: Provider.PLAID,
      externalAccountId: "plaid_mock_account"
    }
  });

  const stripeConn = await prisma.integrationConnection.create({
    data: {
      id: "stripe-demo-conn",
      organizationId: org.id,
      provider: Provider.STRIPE,
      externalAccountId: "stripe_mock_account"
    }
  });

  // Categories per org
  const categoryRows = await Promise.all(
    CATEGORIES.map((name) =>
      prisma.category.create({
        data: { organizationId: org.id, name }
      })
    )
  );
  const categoryByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  // Normalize and insert transactions
  const txns = normalizeAll();

  for (const t of txns) {
    const provider = t.source === "PLAID" ? Provider.PLAID : Provider.STRIPE;
    const connectionId = t.source === "PLAID" ? plaidConn.id : stripeConn.id;
    const status = t.status === "pending" ? TxStatus.pending : TxStatus.posted;
    const categoryId = categoryByName.get(t.inferredCategory) ?? null;

    await prisma.transaction.create({
      data: {
        organizationId: org.id,
        connectionId,
        provider,
        externalId: t.externalId,
        occurredAt: t.occurredAt,
        status,
        amountCents: t.amountCents,
        currency: t.currency,
        description: t.description,
        categoryId,
        rawPayload: t.raw as object
      }
    });
  }

  console.log("Database seeded successfully");
}
