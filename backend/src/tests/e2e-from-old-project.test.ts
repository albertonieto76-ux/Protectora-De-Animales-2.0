import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../config/prisma.js";

describe("pruebas e2e adaptadas del proyecto anterior", () => {
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.solicitudAdopcion.deleteMany(),
      prisma.animal.deleteMany(),
      prisma.voluntario.deleteMany(),
      prisma.evento.deleteMany(),
    ] as any);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("crea y recupera un animal completo", async () => {
    const animalData = {
      name: "Luna",
      species: "Perro",
      age: 3,
      description: "Una perrita muy juguetona",
      imageUrl: "https://example.com/luna.jpg",
    };

    const res = await request(app).post("/api/animals").send(animalData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(animalData.name);
    expect(res.body.species).toBe(animalData.species);
    expect(res.body.age).toBe(animalData.age);
    expect(res.body.description).toBe(animalData.description);
    expect(res.body.imageUrl).toBe(animalData.imageUrl);

    const dbAnimal = await prisma.animal.findUnique({ where: { id: res.body.id } });
    expect(dbAnimal).not.toBeNull();
    expect(dbAnimal?.name).toBe(animalData.name);
  });

  it("crea y lista adopciones con un animal válido", async () => {
    const animal = await prisma.animal.create({
      data: {
        name: "Firulais",
        species: "Perro",
        age: 2,
      },
    });

    const adoptionData = {
      animalId: animal.id,
      nombre: "Sofía",
      email: "sofia@example.com",
      telefono: "611222333",
      mensaje: "Tengo espacio y tiempo para cuidarlo.",
      estado: "pendiente",
    };

    const res = await request(app).post("/api/adoptions").send(adoptionData);

    expect(res.status).toBe(201);
    expect(res.body.animalId).toBe(adoptionData.animalId);
    expect(res.body.nombre).toBe(adoptionData.nombre);

    const list = await request(app).get("/api/adoptions");
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
  });

  it("crea, consulta y elimina un evento", async () => {
    const eventData = {
      titulo: "Feria de Adopción",
      descripcion: "Ven a conocer a nuestros peludos",
      fecha: "2026-08-20T10:00:00.000Z",
      lugar: "Parque Central",
    };

    const created = await request(app).post("/api/events").send(eventData);
    expect(created.status).toBe(201);

    const read = await request(app).get(`/api/events/${created.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.titulo).toBe(eventData.titulo);

    const deleted = await request(app).delete(`/api/events/${created.body.id}`);
    expect(deleted.status).toBe(200);
  });

  it("crea y consulta un voluntario", async () => {
    const volunteerData = {
      nombre: "Carlos",
      email: "carlos@example.com",
      telefono: "600111222",
      disponibilidad: "fines de semana",
      mensaje: "Me gustaría ayudar con los paseos de perros.",
    };

    const created = await request(app).post("/api/volunteers").send(volunteerData);
    expect(created.status).toBe(201);

    const read = await request(app).get(`/api/volunteers/${created.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.nombre).toBe(volunteerData.nombre);
  });
});
