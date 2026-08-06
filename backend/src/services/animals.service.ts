import { prisma } from "../config/prisma.js";

export const findAllAnimals = () => prisma.animal.findMany();

export const findAnimalById = (id: number) =>
  prisma.animal.findUnique({ where: { id } });

export const createNewAnimal = (data: unknown) =>
  prisma.animal.create({ data: data as any });

export const updateExistingAnimal = async (id: number, data: unknown) => {
  try {
    return await prisma.animal.update({ where: { id }, data: data as any });
  } catch {
    return null;
  }
};

export const deleteExistingAnimal = async (id: number) => {
  try {
    await prisma.animal.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
