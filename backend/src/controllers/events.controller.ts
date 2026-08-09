import type { Request, Response } from "express";
import {
  createNewEvent,
  deleteExistingEvent,
  findAllEvents,
  findEventById,
  updateExistingEvent,
} from "../services/events.service.js";
import { filesToDataUrls } from "../utils/imageDataUrl.js";

const getImagesFromRequest = (req: Request) => {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  return filesToDataUrls(files);
};

const normalizeEventPayload = (req: Request) => {
  const body = req.body as Record<string, any>;
  const imagesFromBody = typeof body.images === "string"
    ? [body.images]
    : Array.isArray(body.images)
    ? body.images
    : undefined;
  const uploadedImages = getImagesFromRequest(req);

  return {
    ...body,
    images: uploadedImages.length > 0 ? uploadedImages : imagesFromBody,
  };
};

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
    const payload = normalizeEventPayload(req);
    const event = await createNewEvent(payload);
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear evento" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = normalizeEventPayload(req);
    const updated = await updateExistingEvent(id, payload);

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
