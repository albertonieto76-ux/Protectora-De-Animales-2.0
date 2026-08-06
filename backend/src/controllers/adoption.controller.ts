import type { Request, Response } from "express";
import {
  createAdoption as createAdoptionService,
  deleteAdoption,
  getAdoptionById,
  getAllAdoptions,
  updateAdoption,
} from "../services/adoption.service.js";

export const getAdoptions = async (_req: Request, res: Response) => {
  try {
    const adoptions = await getAllAdoptions();
    res.json(adoptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener adopciones" });
  }
};

export const getAdoption = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const adoption = await getAdoptionById(id);

    if (!adoption) {
      return res.status(404).json({ error: "Adopción no encontrada" });
    }

    res.json(adoption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener adopción" });
  }
};

export const createAdoptionController = async (req: Request, res: Response) => {
  try {
    const newAdoption = await createAdoptionService(req.body);
    res.status(201).json(newAdoption);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear adopción" });
  }
};

export const updateAdoptionController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateAdoption(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar adopción" });
  }
};

export const deleteAdoptionController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteAdoption(id);
    res.json({ message: "Adopción eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar adopción" });
  }
};
