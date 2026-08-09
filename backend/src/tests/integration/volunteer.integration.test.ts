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

  it("CRUD /volunteers/appointments gestiona citas de voluntariado", async () => {
    prismaMock.citaVoluntariado.create.mockResolvedValue({
      id: 10,
      voluntarioId: 1,
      inicio: '2026-08-20T09:00:00.000Z',
      fin: '2026-08-20T11:00:00.000Z',
      estado: 'confirmada',
      notas: 'Apoyo en recepción',
      voluntario: {
        id: 1,
        nombre: 'Ana',
        email: 'ana@test.com',
        telefono: '600111222'
      }
    });

    prismaMock.citaVoluntariado.findMany.mockResolvedValue([
      {
        id: 10,
        voluntarioId: 1,
        inicio: '2026-08-20T09:00:00.000Z',
        fin: '2026-08-20T11:00:00.000Z',
        estado: 'confirmada',
        notas: 'Apoyo en recepción',
        voluntario: {
          id: 1,
          nombre: 'Ana',
          email: 'ana@test.com',
          telefono: '600111222'
        }
      }
    ]);

    prismaMock.citaVoluntariado.update.mockResolvedValue({
      id: 10,
      voluntarioId: 1,
      inicio: '2026-08-20T10:00:00.000Z',
      fin: '2026-08-20T12:00:00.000Z',
      estado: 'pendiente',
      notas: 'Cambio de horario',
      voluntario: {
        id: 1,
        nombre: 'Ana',
        email: 'ana@test.com',
        telefono: '600111222'
      }
    });

    prismaMock.citaVoluntariado.delete.mockResolvedValue({});

    const createRes = await request(app)
      .post('/volunteers/appointments')
      .send({
        voluntarioId: 1,
        inicio: '2026-08-20T09:00:00.000Z',
        fin: '2026-08-20T11:00:00.000Z',
        estado: 'confirmada',
        notas: 'Apoyo en recepción'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBe(10);

    const listRes = await request(app).get('/volunteers/appointments');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveLength(1);

    const updateRes = await request(app)
      .put('/volunteers/appointments/10')
      .send({
        voluntarioId: 1,
        inicio: '2026-08-20T10:00:00.000Z',
        fin: '2026-08-20T12:00:00.000Z',
        estado: 'pendiente',
        notas: 'Cambio de horario'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.estado).toBe('pendiente');

    const deleteRes = await request(app).delete('/volunteers/appointments/10');
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toEqual({ message: 'Cita de voluntariado eliminada correctamente' });
  });

});
