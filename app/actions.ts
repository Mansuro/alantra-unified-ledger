"use server";

import { prisma } from "@/lib/prisma";

export async function updateTransactionCategory(params: {
  organizationId: string;
  transactionId: string;
  categoryId: string | null;
}) {
  const { organizationId, transactionId, categoryId } = params;

  // Ensure txn belongs to org
  const txn = await prisma.transaction.findFirst({
    where: { id: transactionId, organizationId }
  });

  if (!txn) {
    throw new Error("Transaction not found for this organization.");
  }

  if (categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: categoryId, organizationId } });
    if (!cat) throw new Error("Invalid category for this organization.");
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { categoryId }
  });

  return { ok: true };
}
