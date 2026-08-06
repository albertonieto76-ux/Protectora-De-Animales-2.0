import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import {
  findAllEvents,
  findEventById,
  createNewEvent,
  updateExistingEvent,
  deleteExistingEvent
} from "../../services/events.service.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Event Service", () => {

  it("getAllEvents devuelve eventos", async () => {
    const mockEvents = [{ id: 1, titulo: "Evento A" }];
    prismaMock.evento.findMany.mockResolvedValue(mockEvents);

    const result = await findAllEvents();
    expect(result).toEqual(mockEvents);
  });

  it("findEventById devuelve un evento", async () => {
    const mockEvent = { id: 1, titulo: "Evento A" };
    prismaMock.evento.findUnique.mockResolvedValue(mockEvent);

    const result = await findEventById(1);
    expect(result).toEqual(mockEvent);
  });

  it("createNewEvent crea un evento", async () => {
    const mockEvent = { id: 1, titulo: "Nuevo evento" };
    prismaMock.evento.create.mockResolvedValue(mockEvent);

    const result = await createNewEvent({ titulo: "Nuevo evento", fecha: "2024-07-01T00:00:00.000Z" });
    expect(result).toEqual(mockEvent);
  });

  it("updateExistingEvent actualiza un evento", async () => {
    const mockEvent = { id: 1, titulo: "Actualizado" };
    prismaMock.evento.update.mockResolvedValue(mockEvent);

    const result = await updateExistingEvent(1, { titulo: "Actualizado" });
    expect(result).toEqual(mockEvent);
  });

  it("deleteExistingEvent elimina un evento", async () => {
    prismaMock.evento.delete.mockResolvedValue({});

    const result = await deleteExistingEvent(1);
    expect(result).toEqual(true);
  });

});
