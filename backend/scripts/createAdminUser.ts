import bcrypt from "bcryptjs";
import { prisma } from "../src/services/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@protectora.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log("Usuario administrador ya existe");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Usuario administrador creado: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
