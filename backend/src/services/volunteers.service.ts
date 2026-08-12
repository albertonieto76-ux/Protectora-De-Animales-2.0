import { prisma } from "../config/prisma.js";

export const findAllVolunteers = () => prisma.voluntario.findMany();

export const findVolunteerById = (id: number) =>
  prisma.voluntario.findUnique({ where: { id } });

export const createNewVolunteer = async (data: unknown) => {
  const payload = data as Record<string, any>;

  return prisma.$transaction(async (tx: any) => {
    const createdVolunteer = await tx.voluntario.create({
      data: {
        nombre: payload.nombre,
        email: payload.email,
        telefono: payload.telefono ?? null,
        disponibilidad: payload.disponibilidad ?? null,
        mensaje: payload.mensaje ?? null,
      },
    });

    const status = String(payload.estado ?? "pendiente").toLowerCase();
    const interviewStart = new Date();
    interviewStart.setHours(10, 0, 0, 0);
    const interviewEnd = new Date(interviewStart);
    interviewEnd.setHours(interviewStart.getHours() + 2);

    const start = status === "pendiente" ? interviewStart : new Date();
    start.setHours(status === "pendiente" ? start.getHours() : 0, status === "pendiente" ? start.getMinutes() : 0, status === "pendiente" ? start.getSeconds() : 0, status === "pendiente" ? start.getMilliseconds() : 0);
    const end = status === "pendiente" ? interviewEnd : new Date(start);
    if (status !== "pendiente") {
      end.setHours(23, 59, 59, 999);
    }

    await tx.citaVoluntariado.create({
      data: {
        voluntarioId: createdVolunteer.id,
        inicio: start,
        fin: end,
        estado: "pendiente",
        notas: payload.disponibilidad
          ? `Inscripción pública. Disponibilidad: ${payload.disponibilidad}`
          : "Inscripción pública",
      },
    });

    return createdVolunteer;
  });
};

export const updateExistingVolunteer = async (id: number, data: unknown) => {
  try {
    return await prisma.voluntario.update({ where: { id }, data: data as any });
  } catch {
    return null;
  }
};

export const deleteExistingVolunteer = async (id: number) => {
  try {
    await prisma.voluntario.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};

export const findAllVolunteerAppointments = () =>
  prisma.citaVoluntariado.findMany({
    include: {
      voluntario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      },
    },
    orderBy: [{ inicio: "asc" }, { id: "asc" }],
  });

export const createVolunteerAppointment = (data: {
  voluntarioId: number;
  inicio: Date;
  fin: Date;
  estado?: string;
  notas?: string | null;
}) =>
  prisma.citaVoluntariado.create({
    data,
    include: {
      voluntario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
        },
      },
    },
  });

export const updateVolunteerAppointment = async (
  id: number,
  data: {
    voluntarioId: number;
    inicio: Date;
    fin: Date;
    estado?: string;
    notas?: string | null;
  }
) => {
  try {
    return await prisma.citaVoluntariado.update({
      where: { id },
      data,
      include: {
        voluntario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  } catch {
    return null;
  }
};

export const deleteVolunteerAppointment = async (id: number) => {
  try {
    await prisma.citaVoluntariado.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
