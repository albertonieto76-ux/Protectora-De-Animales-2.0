import { prisma } from "../config/prisma.js";

export const findAllPaymentTypes = () => prisma.tipoPago.findMany();

export const createPaymentType = (data: any) =>
  prisma.tipoPago.create({ data });

export const updatePaymentType = (id: number, data: any) =>
  prisma.tipoPago.update({ where: { id }, data });

export const deletePaymentType = async (id: number) => {
  try {
    await prisma.tipoPago.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
