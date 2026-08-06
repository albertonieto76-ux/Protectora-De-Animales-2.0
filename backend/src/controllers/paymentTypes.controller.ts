import type { Request, Response } from "express";
import {
  createPaymentType,
  deletePaymentType,
  findAllPaymentTypes,
  updatePaymentType,
} from "../services/paymentTypes.service.js";

function validateAccount(tipo: string | undefined, account: string | undefined) {
  if (!account) return null;

  if (account.includes("@")) {
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return re.test(account) ? null : "Cuenta inválida: formato de email no válido";
  }

  if (/^ES\d{22}$/i.test(account)) return null;

  if (/^\+?\d{6,15}$/.test(account)) return null;

  if (/^[A-Za-z0-9@._\-+\s]{5,100}$/.test(account)) return null;

  return "Cuenta inválida: formato no reconocido";
}

export const getPaymentTypes = async (_req: Request, res: Response) => {
  try {
    const paymentTypes = await findAllPaymentTypes();
    res.json(paymentTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener tipos de pago" });
  }
};

export const createPaymentTypeController = async (req: Request, res: Response) => {
  try {
    const { tipo, account } = req.body as any;
    const err = validateAccount(tipo, account);
    if (err) return res.status(400).json({ error: err });

    const paymentType = await createPaymentType(req.body);
    res.status(201).json(paymentType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear tipo de pago" });
  }
};

export const updatePaymentTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { tipo, account } = req.body as any;
    const err = validateAccount(tipo, account);
    if (err) return res.status(400).json({ error: err });

    const paymentType = await updatePaymentType(id, req.body);
    res.json(paymentType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar tipo de pago" });
  }
};

export const deletePaymentTypeController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deletePaymentType(id);
    if (!deleted) return res.status(404).json({ error: "Tipo de pago no encontrado" });
    res.json({ message: "Tipo de pago eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar tipo de pago" });
  }
};
