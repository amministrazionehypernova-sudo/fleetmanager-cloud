const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const company = await prisma.company.upsert({
    where: {
      id: "demo-company"
    },
    update: {},
    create: {
      id: "demo-company",
      name: "Azienda Demo"
    }
  });

  await prisma.user.upsert({
    where: {
      email: "admin@demo.it"
    },
    update: {
      password: passwordHash
    },
    create: {
      companyId: company.id,
      email: "admin@demo.it",
      password: passwordHash,
      fullName: "Admin Demo",
      role: "admin"
    }
  });

  console.log("Seed completato.");
  console.log("Email: admin@demo.it");
  console.log("Password: admin123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });