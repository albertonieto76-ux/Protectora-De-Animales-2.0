import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock prisma BEFORE importing routes
import { prismaMock } from "./prisma.mock.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

// Import route after mocking
import volunteerRoutes from "../../routes/volunteers.routes.ts";

const app = express();
app.use(express.json());
app.use("/volunteers", volunteerRoutes);

beforeEach(() => vi.clearAllMocks());

describe("Voluntarios - Integración", () => {

  
  it("POST /volunteers crea un voluntario", async () => {
    prismaMock.voluntario.create.mockResolvedValue({
      id: 1,
      nombre: "Ana",
      telefono: "600111222"
    });

    const res = await request(app)
      .post("/volunteers")
      .send({ nombre: "Ana", telefono: "600111222" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Ana",
      telefono: "600111222"
    });
  });

it("GET /volunteers devuelve lista de voluntarios", async () => {
    prismaMock.voluntario.findMany.mockResolvedValue([
      { id: 1, nombre: "Ana", telefono: "600111222" }
    ]);

    const res = await request(app).get("/volunteers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, nombre: "Ana", telefono: "600111222" }
    ]);
  });


  it("PUT /volunteers/:id actualiza un voluntario", async () => {
    prismaMock.voluntario.update.mockResolvedValue({
      id: 1,
      nombre: "Ana actualizada"
    });

    const res = await request(app)
      .put("/volunteers/1")
      .send({ nombre: "Ana actualizada" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Ana actualizada"
    });
  });

  it("DELETE /volunteers/:id elimina un voluntario", async () => {
    prismaMock.voluntario.delete.mockResolvedValue({});

    const res = await request(app).delete("/volunteers/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Voluntario eliminado correctamente" });
  });

});
