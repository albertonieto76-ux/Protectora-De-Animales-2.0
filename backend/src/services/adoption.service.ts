import { prisma } from "../config/prisma.js";

export const getAllAdoptions = async () => prisma.solicitudAdopcion.findMany();

export const getAdoptionById = async (id: number) =>
  prisma.solicitudAdopcion.findUnique({ where: { id } });

export const createAdoption = async (data: any) =>
  prisma.solicitudAdopcion.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      mensaje: data.mensaje,
      estado: data.estado,
      animalId: Number(data.animalId),
    },
  });

export const updateAdoption = async (id: number, data: any) =>
  prisma.solicitudAdopcion.update({ where: { id }, data });

export const deleteAdoption = async (id: number) =>
  prisma.solicitudAdopcion.delete({ where: { id } });
