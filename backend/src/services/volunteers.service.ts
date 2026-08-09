import { prisma } from "../config/prisma.js";

export const findAllVolunteers = () => prisma.voluntario.findMany();

export const findVolunteerById = (id: number) =>
  prisma.voluntario.findUnique({ where: { id } });

export const createNewVolunteer = (data: unknown) =>
  prisma.voluntario.create({ data: data as any });

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
