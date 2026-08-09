import bcrypt from "bcryptjs";
import { prisma } from "../src/services/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@protectora.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.usuario.upsert({
    where: { email },
    update: {
      nombre: "Administrador",
      password: hashedPassword,
      role: "admin",
    },
    create: {
      nombre: "Administrador",
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Usuario administrador listo: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
