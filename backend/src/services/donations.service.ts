import { prisma } from "../config/prisma.js";

export const findAllDonations = () =>
  prisma.donacion.findMany({ include: { metodo: true } });

export const findDonationById = (id: number) =>
  prisma.donacion.findUnique({ where: { id }, include: { metodo: true } });

export const createDonation = (data: any) => {
  const amount = Number(data.cantidad);
  const metodoId = Number(data.metodoId);
  return prisma.donacion.create({
    data: { ...data, cantidad: amount, metodoId } as any,
    include: { metodo: true },
  });
};

export const updateDonation = async (id: number, data: any) => {
  try {
    const updatedData = { ...data };
    if (updatedData.cantidad !== undefined) {
      updatedData.cantidad = Number(updatedData.cantidad);
    }
    if (updatedData.metodoId !== undefined) {
      updatedData.metodoId = Number(updatedData.metodoId);
    }
    return await prisma.donacion.update({
      where: { id },
      data: updatedData as any,
      include: { metodo: true },
    });
  } catch {
    return null;
  }
};

export const deleteDonation = async (id: number) => {
  try {
    await prisma.donacion.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
