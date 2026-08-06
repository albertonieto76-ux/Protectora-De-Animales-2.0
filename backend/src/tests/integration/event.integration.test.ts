import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock prisma BEFORE importing routes
import { prismaMock } from "./prisma.mock.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

// Import route after mocking
import eventRoutes from "../../routes/events.routes.ts";

// Crear app Express para pruebas
const app = express();
app.use(express.json());
app.use("/events", eventRoutes);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Eventos - Tests de integración", () => {

  it("GET /events devuelve lista de eventos", async () => {
    prismaMock.evento.findMany.mockResolvedValue([
      { id: 1, titulo: "Jornada de adopción", fecha: "2024-05-10" },
      { id: 2, titulo: "Campaña solidaria", fecha: "2024-06-01" }
    ]);

    const res = await request(app).get("/events");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, titulo: "Jornada de adopción", fecha: "2024-05-10" },
      { id: 2, titulo: "Campaña solidaria", fecha: "2024-06-01" }
    ]);
  });

  it("GET /events/:id devuelve un evento", async () => {
    prismaMock.evento.findUnique.mockResolvedValue({
      id: 1,
      titulo: "Jornada de adopción",
      fecha: "2024-05-10"
    });

    const res = await request(app).get("/events/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      titulo: "Jornada de adopción",
      fecha: "2024-05-10"
    });
  });

  it("POST /events crea un evento", async () => {
    prismaMock.evento.create.mockResolvedValue({
      id: 1,
      titulo: "Nuevo evento",
      fecha: "2024-07-01"
    });

    const res = await request(app)
      .post("/events")
      .send({ titulo: "Nuevo evento", fecha: "2024-07-01" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      titulo: "Nuevo evento",
      fecha: "2024-07-01"
    });
  });

  it("PUT /events/:id actualiza un evento", async () => {
    prismaMock.evento.update.mockResolvedValue({
      id: 1,
      titulo: "Evento actualizado",
      fecha: "2024-07-01"
    });

    const res = await request(app)
      .put("/events/1")
      .send({ titulo: "Evento actualizado" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      titulo: "Evento actualizado",
      fecha: "2024-07-01"
    });
  });

  it("DELETE /events/:id elimina un evento", async () => {
    prismaMock.evento.delete.mockResolvedValue({});

    const res = await request(app).delete("/events/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Evento eliminado correctamente"
    });
  });

  it("GET /events devuelve error 500 si Prisma falla", async () => {
    prismaMock.evento.findMany.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/events");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: "Error al obtener eventos"
    });
  });

});
