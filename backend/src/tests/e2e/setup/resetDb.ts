import { prisma } from '../../../services/prisma.ts';

export const resetDb = async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "SolicitudAdopcion",
      "Donacion",
      "Voluntario",
      "Animal",
      "Evento"
    RESTART IDENTITY CASCADE;
  `);
};
