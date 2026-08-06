import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("CRUD de adopciones", () => {
  it("crea una adopción vía POST /api/adoptions", async () => {
    const animalResponse = await request(app).post("/api/animals").send({
      name: "Luna",
      species: "Perro",
      age: 3,
      description: "Animal creado para la prueba de adopción",
    });

    expect(animalResponse.status).toBe(201);

    const payload = {
      nombre: "Usuario de prueba",
      email: "prueba@example.com",
      telefono: "600000000",
      mensaje: "Solicitud de prueba",
      estado: "pendiente",
      animalId: animalResponse.body.id,
    };

    const response = await request(app).post("/api/adoptions").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      nombre: payload.nombre,
      email: payload.email,
      estado: payload.estado,
      animalId: payload.animalId,
    });
  });
});
