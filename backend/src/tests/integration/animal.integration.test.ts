import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock prisma BEFORE importing routes
import { prismaMock } from "./prisma.mock.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

import animalRoutes from "../../routes/animals.routes.ts";

const app = express();
app.use(express.json());
app.use("/animals", animalRoutes);

beforeEach(() => vi.clearAllMocks());

describe("Animales - Integración", () => {

   it("POST /animals crea un animal", async () => {
    prismaMock.animal.create.mockResolvedValue({
      id: 1,
      nombre: "Luna",
      especie: "Perro",

    });

    const res = await request(app)
      .post("/animals")
      .send({ nombre: "Luna", especie: "Perro" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Luna",
      especie: "Perro"
    });
  });

  it("GET /animals devuelve lista de animales", async () => {
    prismaMock.animal.findMany.mockResolvedValue([
      { id: 1, nombre: "Luna", especie: "Perro" }
    ]);

    const res = await request(app).get("/animals");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, nombre: "Luna", especie: "Perro" }
    ]);
  });

   it("PUT /animals/:id actualiza un animal", async () => {
    prismaMock.animal.update.mockResolvedValue({
      id: 1,
      nombre: "Luna actualizada"
    });

    const res = await request(app)
      .put("/animals/1")
      .send({ nombre: "Luna actualizada" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Luna actualizada"
    });
  });

  it("DELETE /animals/:id elimina un animal", async () => {
    prismaMock.animal.delete.mockResolvedValue({});

    const res = await request(app).delete("/animals/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Animal eliminado correctamente" });
  });

});
