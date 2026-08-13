import request from "supertest";
import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import app from "../app.js";

const buildAdminToken = () =>
  jwt.sign(
    { sub: 1, role: "admin", email: "admin@protectora.com" },
    process.env.JWT_SECRET || "change-me-in-production",
    { issuer: "protectora-backend", audience: "protectora-admin" }
  );

describe("CRUD de adopciones", () => {
  it("crea una adopción vía POST /api/adoptions", async () => {
    const adminToken = buildAdminToken();
    const animalResponse = await request(app)
      .post("/api/animals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
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
