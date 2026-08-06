import type { Request, Response } from "express";
import {
  createDonation as createDonationService,
  deleteDonation,
  findAllDonations,
  findDonationById,
  updateDonation,
} from "../services/donations.service.js";

export const getDonations = async (_req: Request, res: Response) => {
  try {
    const donations = await findAllDonations();
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener donaciones" });
  }
};

export const getDonationById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const donation = await findDonationById(id);

    if (!donation) {
      return res.status(404).json({ error: "Donación no encontrada" });
    }

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener donación" });
  }
};

export const createDonation = async (req: Request, res: Response) => {
  try {
    const newDonation = await createDonationService(req.body);
    res.status(201).json(newDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear donación" });
  }
};

export const updateDonationController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateDonation(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Donación no encontrada" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar donación" });
  }
};

export const deleteDonationController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteDonation(id);

    if (!deleted) {
      return res.status(404).json({ error: "Donación no encontrada" });
    }

    res.json({ message: "Donación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar donación" });
  }
};
