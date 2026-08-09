import { prisma } from "../config/prisma.js";

export const findAllEvents = () =>
  prisma.evento.findMany({
    orderBy: { createdAt: "desc" },
  });

export const findEventById = (id: number) =>
  prisma.evento.findUnique({ where: { id } });

export const createNewEvent = (data: any) =>
  prisma.evento.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      lugar: data.lugar,
      fecha: new Date(data.fecha),
      images: Array.isArray(data.images) ? data.images : [],
    },
  });

export const updateExistingEvent = async (id: number, data: unknown) => {
  try {
    return await prisma.evento.update({ where: { id }, data: data as any });
  } catch {
    return null;
  }
};

export const deleteExistingEvent = async (id: number) => {
  try {
    await prisma.evento.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
