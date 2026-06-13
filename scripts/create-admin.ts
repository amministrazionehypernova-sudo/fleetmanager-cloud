import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: {
      id: "demo-company",
    },
    update: {},
    create: {
      id: "demo-company",
      name: "Demo Company",
    },
  });

  await prisma.user.upsert({
    where: {
      email: "admin@fleetmanager.local",
    },
    update: {
      password:
        "$2b$10$QFRDQm1lLBQOI.DT92.dd.mtPXvA1rVFpNbdYe65pNHnGxgdWijvS",
      companyId: company.id,
      fullName: "Admin",
      role: "admin",
    },
    create: {
      companyId: company.id,
      email: "admin@fleetmanager.local",
      password:
        "$2b$10$QFRDQm1lLBQOI.DT92.dd.mtPXvA1rVFpNbdYe65pNHnGxgdWijvS",
      fullName: "Admin",
      role: "admin",
    },
  });

  console.log("Admin creato/aggiornato correttamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });