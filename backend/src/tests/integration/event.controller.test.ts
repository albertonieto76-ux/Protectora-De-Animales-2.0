import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from "../../controllers/events.controller.ts";
import * as eventsService from "../../services/events.service.ts";

vi.mock("../../services/events.service.ts");

describe("Event Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it("getEvents devuelve lista de eventos", async () => {
    const mockEvents = [
      { id: 1, titulo: "Jornada de adopción", fecha: "2024-05-10" },
      { id: 2, titulo: "Campaña solidaria", fecha: "2024-06-01" }
    ];
    vi.spyOn(eventsService, "findAllEvents").mockResolvedValue(mockEvents as any);

    await getEvents(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvents);
  });

  it("getEventById devuelve un evento por ID", async () => {
    const mockEvent = {
      id: 1,
      titulo: "Jornada de adopción",
      fecha: "2024-05-10"
    };
    vi.spyOn(eventsService, "findEventById").mockResolvedValue(mockEvent as any);

    req.params = { id: "1" };

    await getEventById(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });

  it("createEvent crea un evento", async () => {
    const mockEvent = {
      id: 1,
      titulo: "Nuevo evento",
      fecha: "2024-07-01T00:00:00.000Z"
    };
    vi.spyOn(eventsService, "createNewEvent").mockResolvedValue(mockEvent as any);

    req.body = { titulo: "Nuevo evento", fecha: "2024-07-01T00:00:00.000Z" };

    await createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });

  it("updateEvent actualiza un evento", async () => {
    const mockEvent = {
      id: 1,
      titulo: "Evento actualizado",
      fecha: "2024-07-01"
    };
    vi.spyOn(eventsService, "updateExistingEvent").mockResolvedValue(mockEvent as any);

    req.params = { id: "1" };
    req.body = { titulo: "Evento actualizado" };

    await updateEvent(req, res);

    expect(res.json).toHaveBeenCalledWith(mockEvent);
  });

  it("deleteEvent elimina un evento", async () => {
    vi.spyOn(eventsService, "deleteExistingEvent").mockResolvedValue(true as any);

    req.params = { id: "1" };

    await deleteEvent(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Evento eliminado correctamente"
    });
  });

  it("getEvents devuelve error 500 si Prisma falla", async () => {
    vi.spyOn(eventsService, "findAllEvents").mockRejectedValue(new Error("DB error"));

    await getEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error al obtener eventos"
    });
  });

});
