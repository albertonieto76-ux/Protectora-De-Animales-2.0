import bcrypt from "bcryptjs";
import { prisma } from "../src/services/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@protectora.com";
  const password = process.env.ADMIN_PASSWORD || "Admin1234!";

  const existing = await prisma.usuario.findUnique({ where: { email } });

  if (existing) {
    console.log(`Administrador ya existente: ${email}`);
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

  console.log(`Administrador creado: ${email}`);
  console.log(`Contraseña temporal: ${password}`);
}

main()
  .catch((error) => {
    console.error("Error creando administrador:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
