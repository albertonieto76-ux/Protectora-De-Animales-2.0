import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("pruebas de integración importadas del proyecto anterior", () => {
  it("GET /api/animals devuelve la lista de animales", async () => {
    const res = await request(app).get("/api/animals").timeout({ response: 10000, deadline: 15000 });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/animals crea un animal", async () => {
    const res = await request(app)
      .post("/api/animals")
      .send({
        name: "Luna",
        species: "Perro",
        age: 3,
        description: "Animal creado desde la prueba integrada",
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Luna", species: "Perro" });
  });

  it("GET /api/adoptions devuelve la lista de adopciones", async () => {
    const res = await request(app).get("/api/adoptions");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/adoptions crea una adopción con animal válido", async () => {
    const animal = await request(app).post("/api/animals").send({
      name: "Milo",
      species: "Gato",
      age: 2,
      description: "Animal para adopción en prueba integrada",
    });

    const res = await request(app)
      .post("/api/adoptions")
      .send({
        nombre: "Ana",
        email: "ana@example.com",
        telefono: "600111222",
        mensaje: "Prueba integrada",
        estado: "pendiente",
        animalId: animal.body.id,
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nombre: "Ana", estado: "pendiente" });
  });

  it("GET /api/volunteers devuelve la lista de voluntarios", async () => {
    const res = await request(app).get("/api/volunteers");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/events devuelve la lista de eventos", async () => {
    const res = await request(app).get("/api/events");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
