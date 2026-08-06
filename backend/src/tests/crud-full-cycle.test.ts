import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("ciclo completo CRUD de adopciones", () => {
  it("crea, actualiza y elimina una adopción", async () => {
    const animalResponse = await request(app).post("/api/animals").send({
      name: "Milo",
      species: "Gato",
      age: 2,
      description: "Animal para prueba de ciclo CRUD",
    });

    expect(animalResponse.status).toBe(201);

    const createResponse = await request(app).post("/api/adoptions").send({
      nombre: "Usuario CRUD",
      email: "crud@example.com",
      telefono: "611111111",
      mensaje: "Prueba de ciclo",
      estado: "pendiente",
      animalId: animalResponse.body.id,
    });

    expect(createResponse.status).toBe(201);
    const adoptionId = createResponse.body.id;

    const updateResponse = await request(app).put(`/api/adoptions/${adoptionId}`).send({
      estado: "aceptada",
      mensaje: "Actualizada por prueba",
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: adoptionId,
      estado: "aceptada",
    });

    const deleteResponse = await request(app).delete(`/api/adoptions/${adoptionId}`);

    expect(deleteResponse.status).toBe(200);
  });
});
