import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.ts';
import { resetDb } from './setup/resetDb.ts';
import { prisma } from '../../services/prisma.ts';

const buildAdminToken = () =>
  jwt.sign(
    { sub: 1, role: 'admin', email: 'admin@protectora.com' },
    process.env.JWT_SECRET || 'change-me-in-production',
    { issuer: 'protectora-backend', audience: 'protectora-admin' }
  );

describe('Adoptions E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new adoption request (POST /adoptions)', async () => {
    // 1. Create a parent Animal record first to satisfy foreign key constraint
    const animal = await prisma.animal.create({
      data: {
        name: 'Firulais',
        species: 'Perro',
        age: 2
      }
    });

    const adoptionData = {
      animalId: animal.id,
      nombre: 'Sofía',
      email: 'sofia@example.com',
      telefono: '611222333',
      mensaje: 'Tengo espacio en casa y tiempo para cuidarlo.',
      estado: 'pendiente'
    };

    const res = await request(app).post('/api/adoptions').send(adoptionData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.animalId).toBe(adoptionData.animalId);
    expect(res.body.nombre).toBe(adoptionData.nombre);
    expect(res.body.email).toBe(adoptionData.email);
    expect(res.body.telefono).toBe(adoptionData.telefono);
    expect(res.body.mensaje).toBe(adoptionData.mensaje);
    expect(res.body.estado).toBe(adoptionData.estado);

    // Verify it exists in the database
    const dbAdoption = await prisma.solicitudAdopcion.findUnique({
      where: { id: res.body.id }
    });
    console.log("RESPONSE:", res.status, res.body);
    console.log(res.body);

    expect(dbAdoption).not.toBeNull();
    expect(dbAdoption!.nombre).toBe(adoptionData.nombre);
  });

  it('should list all adoptions (GET /adoptions)', async () => {
    const animal = await prisma.animal.create({
      data: { name: 'Kira', species: 'Perro' }
    });

    const created = await prisma.solicitudAdopcion.create({
      data: {
        animalId: animal.id,
        nombre: 'Mario',
        email: 'mario@example.com'
      }
    });

    const res = await request(app).get('/api/adoptions');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(created.id);
    expect(res.body[0].nombre).toBe('Mario');
  });

  it('should get an adoption request by ID (GET /adoptions/:id)', async () => {
    const animal = await prisma.animal.create({
      data: { name: 'Kira', species: 'Perro' }
    });

    const created = await prisma.solicitudAdopcion.create({
      data: {
        animalId: animal.id,
        nombre: 'Lucía',
        email: 'lucia@example.com'
      }
    });

    const res = await request(app).get(`/api/adoptions/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Lucía');

    // Test non-existing adoption request
    const resNotFound = await request(app).get('/api/adoptions/9999');
    expect(resNotFound.status).toBe(404);
  });

  it('should update an adoption request (PUT /adoptions/:id)', async () => {
    const adminToken = buildAdminToken();
    const animal = await prisma.animal.create({
      data: { name: 'Kira', species: 'Perro' }
    });

    const created = await prisma.solicitudAdopcion.create({
      data: {
        animalId: animal.id,
        nombre: 'Pedro',
        email: 'pedro@example.com',
        estado: 'pendiente'
      }
    });

    const updateData = {
      estado: 'aprobada',
      nombre: 'Pedro Modificado'
    };

    const res = await request(app)
      .put(`/api/adoptions/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('aprobada');
    expect(res.body.nombre).toBe('Pedro Modificado');

    // Verify database record has been updated
    const dbAdoption = await prisma.solicitudAdopcion.findUnique({
      where: { id: created.id }
    });
    expect(dbAdoption!.estado).toBe('aprobada');
    expect(dbAdoption!.nombre).toBe('Pedro Modificado');
  });

  it('should delete an adoption request (DELETE /adoptions/:id)', async () => {
    const adminToken = buildAdminToken();
    const animal = await prisma.animal.create({
      data: { name: 'Kira', species: 'Perro' }
    });

    const created = await prisma.solicitudAdopcion.create({
      data: {
        animalId: animal.id,
        nombre: 'Juana',
        email: 'juana@example.com'
      }
    });

    const res = await request(app)
      .delete(`/api/adoptions/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Adopción eliminada correctamente');

    // Verify deleted in database
    const dbAdoption = await prisma.solicitudAdopcion.findUnique({
      where: { id: created.id }
    });
    expect(dbAdoption).toBeNull();
  });
});
