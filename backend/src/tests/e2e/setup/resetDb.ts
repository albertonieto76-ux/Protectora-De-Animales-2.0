import { prisma } from '../../../services/prisma.ts';

export const resetDb = async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "CitaVoluntariado",
      "SolicitudAdopcion",
      "Donacion",
      "TipoPago",
      "Voluntario",
      "AsistenteEvento",
      "Animal",
      "Evento",
      "Usuario",
      "SecurityAuditLog"
    RESTART IDENTITY CASCADE;
  `);
};
