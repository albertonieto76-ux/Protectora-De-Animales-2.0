import type { Request, Response } from "express";
import {
  createNewVolunteer,
  deleteExistingVolunteer,
  findAllVolunteers,
  findVolunteerById,
  updateExistingVolunteer,
} from "../services/volunteers.service.js";

export const getVolunteers = async (_req: Request, res: Response) => {
  try {
    const volunteers = await findAllVolunteers();
    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener voluntarios" });
  }
};

export const getVolunteerById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const volunteer = await findVolunteerById(id);

    if (!volunteer) {
      return res.status(404).json({ error: "Voluntario no encontrado" });
    }

    res.json(volunteer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener voluntario" });
  }
};

export const createVolunteer = async (req: Request, res: Response) => {
  try {
    const volunteer = await createNewVolunteer(req.body);
    res.status(201).json(volunteer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear voluntario" });
  }
};

export const updateVolunteer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateExistingVolunteer(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Voluntario no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar voluntario" });
  }
};

export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteExistingVolunteer(id);

    if (!deleted) {
      return res.status(404).json({ error: "Voluntario no encontrado" });
    }

    res.json({ message: "Voluntario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar voluntario" });
  }
};
