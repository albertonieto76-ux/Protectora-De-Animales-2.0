import { prisma } from "../config/prisma.js";

export const getAllAdoptions = async () =>
  prisma.solicitudAdopcion.findMany({ include: { animal: true } });

export const getAdoptionById = async (id: number) =>
  prisma.solicitudAdopcion.findUnique({ where: { id }, include: { animal: true } });

export const createAdoption = async (data: any) => {
  const animalId = Number(data.animalId);

  if (!Number.isInteger(animalId) || animalId <= 0) {
    throw new Error("animalId es obligatorio y debe ser un ID válido");
  }

  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    throw new Error("No existe un animal con ese ID");
  }

  return prisma.solicitudAdopcion.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      mensaje: data.mensaje,
      estado: data.estado ?? "pendiente",
      animalId,
    },
  });
};

export const updateAdoption = async (id: number, data: any) => {
  const normalizedData = { ...data };

  if (Object.prototype.hasOwnProperty.call(data, "fechaCita")) {
    normalizedData.fechaCita = data.fechaCita ? new Date(data.fechaCita) : null;
  }

  return prisma.solicitudAdopcion.update({ where: { id }, data: normalizedData });
};

export const deleteAdoption = async (id: number) =>
  prisma.solicitudAdopcion.delete({ where: { id } });
