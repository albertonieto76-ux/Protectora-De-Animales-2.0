import bcrypt from "bcryptjs";
import { prisma } from "../src/services/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@protectora.com";
  const password = process.env.ADMIN_PASSWORD || "Admin1234!";

  const existing = await prisma.usuario.findUnique({ where: { email } });


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
  console.log(`Contraseña activa: ${password}`);
}

main()
  .catch((error) => {
    console.error("Error creando administrador:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
