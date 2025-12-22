import { prisma } from "./prisma";
import { seedDatabase } from "./seed-fn";

async function main() {
  await seedDatabase(prisma);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
