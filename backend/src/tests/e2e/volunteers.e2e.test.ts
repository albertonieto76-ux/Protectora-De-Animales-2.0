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

console.log('DB usada por tests:', process.env.DATABASE_URL);

describe('Volunteers E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a volunteer (POST /api/volunteers)', async () => {
    const volunteerData = {
      nombre: 'Carlos',
      email: 'carlos@example.com',
      telefono: '600111222',
      disponibilidad: 'fines de semana',
      mensaje: 'Me gustaría ayudar con los paseos de perros.'
    };

    const res = await request(app)
      .post('/api/volunteers')
      .send(volunteerData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe(volunteerData.nombre);
    expect(res.body.email).toBe(volunteerData.email);
    expect(res.body.telefono).toBe(volunteerData.telefono);
    expect(res.body.disponibilidad).toBe(volunteerData.disponibilidad);
    expect(res.body.mensaje).toBe(volunteerData.mensaje);

    // Verify database record
    const dbVolunteer = await prisma.voluntario.findUnique({
      where: { id: res.body.id }
    });
    expect(dbVolunteer).not.toBeNull();
    expect(dbVolunteer!.nombre).toBe(volunteerData.nombre);
  });

  it('should get all volunteers (GET /api/volunteers)', async () => {
    const created = await prisma.voluntario.create({
      data: {
        nombre: 'Ana',
        email: 'ana@example.com',
        telefono: '600333444'
      }
    });

    const res = await request(app).get('/api/volunteers');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(created.id);
    expect(res.body[0].nombre).toBe('Ana');
  });

  it('should get a volunteer by id (GET /api/volunteers/:id)', async () => {
    const created = await prisma.voluntario.create({
      data: {
        nombre: 'Marta',
        email: 'marta@example.com'
      }
    });

    const res = await request(app).get(`/api/volunteers/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Marta');

    // Test non-existing volunteer
    const resNotFound = await request(app).get('/api/volunteers/9999');
    expect(resNotFound.status).toBe(404);
  });

  it('should update a volunteer (PUT /api/volunteers/:id)', async () => {
    const adminToken = buildAdminToken();
    const created = await prisma.voluntario.create({
      data: {
        nombre: 'David',
        email: 'david@example.com',
        disponibilidad: 'tarde'
      }
    });

    const updateData = {
      nombre: 'David Modificado',
      disponibilidad: 'mañana'
    };

    const res = await request(app)
      .put(`/api/volunteers/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('David Modificado');
    expect(res.body.disponibilidad).toBe('mañana');

    // Verify updated database record
    const dbVolunteer = await prisma.voluntario.findUnique({
      where: { id: created.id }
    });
    expect(dbVolunteer!.nombre).toBe('David Modificado');
    expect(dbVolunteer!.disponibilidad).toBe('mañana');
  });

  it('should delete a volunteer (DELETE /api/volunteers/:id)', async () => {
    const adminToken = buildAdminToken();
    const created = await prisma.voluntario.create({
      data: {
        nombre: 'Luis',
        email: 'luis@example.com'
      }
    });

    const res = await request(app)
      .delete(`/api/volunteers/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Voluntario eliminado correctamente');

    // Verify deleted in database
    const dbVolunteer = await prisma.voluntario.findUnique({
      where: { id: created.id }
    });
    expect(dbVolunteer).toBeNull();
  });
});
