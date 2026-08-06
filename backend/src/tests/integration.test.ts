import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("pruebas de integración del backend migrado", () => {
  it("devuelve el health check y el listado de recursos principales", async () => {
    const health = await request(app).get("/health");
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: "ok" });

    const animals = await request(app).get("/api/animals");
    expect(animals.status).toBe(200);
    expect(Array.isArray(animals.body)).toBe(true);

    const adoptions = await request(app).get("/api/adoptions");
    expect(adoptions.status).toBe(200);
    expect(Array.isArray(adoptions.body)).toBe(true);

    const volunteers = await request(app).get("/api/volunteers");
    expect(volunteers.status).toBe(200);
    expect(Array.isArray(volunteers.body)).toBe(true);

    const events = await request(app).get("/api/events");
    expect(events.status).toBe(200);
    expect(Array.isArray(events.body)).toBe(true);
  });

  it("crea un animal y una adopción relacionados", async () => {
    const animal = await request(app).post("/api/animals").send({
      name: "Nube",
      species: "Perro",
      age: 4,
      description: "Animal creado en prueba de integración",
    });

    expect(animal.status).toBe(201);
    expect(animal.body).toMatchObject({ name: "Nube", species: "Perro" });

    const adoption = await request(app).post("/api/adoptions").send({
      nombre: "Integración",
      email: "integracion@example.com",
      telefono: "622222222",
      mensaje: "Prueba de integración",
      estado: "pendiente",
      animalId: animal.body.id,
    });

    expect(adoption.status).toBe(201);
    expect(adoption.body).toMatchObject({ animalId: animal.body.id, estado: "pendiente" });
  });
});
