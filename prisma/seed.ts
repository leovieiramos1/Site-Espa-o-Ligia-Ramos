import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    console.log("Já existe um administrador cadastrado — nada para semear.");
    return;
  }

  const passwordHash = await bcrypt.hash("Ligia@2026", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Lígia Ramos",
      email: "admin@gmail.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Usuário administrador criado:");
  console.log(`  E-mail: ${admin.email}`);
  console.log("  Senha:  Ligia@2026");
  console.log("Troque essa senha após o primeiro acesso.");
  console.log("Nenhum outro dado foi criado — o sistema está zerado para começar o cadastro real.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
