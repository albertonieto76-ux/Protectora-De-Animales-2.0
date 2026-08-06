import type { Request, Response } from "express";
import {
  createNewEvent,
  deleteExistingEvent,
  findAllEvents,
  findEventById,
  updateExistingEvent,
} from "../services/events.service.js";

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await findAllEvents();
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const event = await findEventById(id);

    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener evento" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = await createNewEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear evento" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateExistingEvent(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar evento" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteExistingEvent(id);

    if (!deleted) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar evento" });
  }
};
