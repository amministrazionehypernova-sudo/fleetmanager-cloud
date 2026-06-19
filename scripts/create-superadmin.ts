import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: {
      id: "hypernova-company",
    },
    update: {
      name: "Hypernova",
    },
    create: {
      id: "hypernova-company",
      name: "Hypernova",
    },
  });

  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: {
      email: "info@hypernova-lab.com",
    },
    update: {
      companyId: company.id,
      fullName: "Hypernova Admin",
      password,
      role: "superadmin",
    },
    create: {
      companyId: company.id,
      email: "info@hypernova-lab.com",
      fullName: "Hypernova Admin",
      password,
      role: "superadmin",
    },
  });

  console.log("Super Admin Hypernova creato/aggiornato correttamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });