import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "_prisma_migrations";`);
}

main().finally(() => prisma.$disconnect());
