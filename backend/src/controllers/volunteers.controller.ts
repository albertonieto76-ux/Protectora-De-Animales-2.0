import type { Request, Response } from "express";
import {
  createVolunteerAppointment,
  createNewVolunteer,
  deleteVolunteerAppointment,
  deleteExistingVolunteer,
  findAllVolunteerAppointments,
  findAllVolunteers,
  findVolunteerById,
  updateVolunteerAppointment,
  updateExistingVolunteer,
} from "../services/volunteers.service.js";

const parseAppointmentPayload = (body: Request["body"]) => {
  const voluntarioId = Number(body.voluntarioId);
  const inicio = new Date(body.inicio);
  const fin = new Date(body.fin);
  const estado = typeof body.estado === "string" && body.estado.trim() ? body.estado.trim() : "confirmada";
  const notas = typeof body.notas === "string" && body.notas.trim() ? body.notas.trim() : null;

  if (!Number.isInteger(voluntarioId) || voluntarioId <= 0) {
    return { error: "El voluntario es obligatorio" };
  }

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return { error: "Las fechas de inicio y fin son obligatorias" };
  }

  if (inicio >= fin) {
    return { error: "La fecha de fin debe ser posterior al inicio" };
  }

  return {
    data: {
      voluntarioId,
      inicio,
      fin,
      estado,
      notas,
    },
  };
};

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

export const getVolunteerAppointments = async (_req: Request, res: Response) => {
  try {
    const appointments = await findAllVolunteerAppointments();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener citas de voluntariado" });
  }
};

export const createVolunteerAppointmentEntry = async (req: Request, res: Response) => {
  const parsed = parseAppointmentPayload(req.body);

  if ("error" in parsed) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const appointment = await createVolunteerAppointment(parsed.data);
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la cita de voluntariado" });
  }
};

export const updateVolunteerAppointmentEntry = async (req: Request, res: Response) => {
  const parsed = parseAppointmentPayload(req.body);

  if ("error" in parsed) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    const id = Number(req.params.appointmentId);
    const updated = await updateVolunteerAppointment(id, parsed.data);

    if (!updated) {
      return res.status(404).json({ error: "Cita de voluntariado no encontrada" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la cita de voluntariado" });
  }
};

export const deleteVolunteerAppointmentEntry = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.appointmentId);
    const deleted = await deleteVolunteerAppointment(id);

    if (!deleted) {
      return res.status(404).json({ error: "Cita de voluntariado no encontrada" });
    }

    res.json({ message: "Cita de voluntariado eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la cita de voluntariado" });
  }
};
