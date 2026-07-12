import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPassword = await bcrypt.hash("Admin1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@semeshop.com" },
    update: {},
    create: {
      name: "Administrateur",
      email: "admin@semeshop.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Semeshop",
      email: "contact@semeshop.com",
      currency: "EUR",
    },
  });

  console.log("Seed terminé. Compte admin : admin@semeshop.com / Admin1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
