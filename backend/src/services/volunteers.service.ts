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
