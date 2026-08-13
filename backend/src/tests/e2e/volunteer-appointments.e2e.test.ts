import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.ts';
import { prisma } from '../../services/prisma.ts';
import { resetDb } from './setup/resetDb.ts';

const buildAdminToken = () =>
  jwt.sign(
    { sub: 1, role: 'admin', email: 'admin@protectora.com' },
    process.env.JWT_SECRET || 'change-me-in-production',
    { issuer: 'protectora-backend', audience: 'protectora-admin' }
  );

describe('Volunteer appointments E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates, lists, updates and deletes a volunteer appointment', async () => {
    const adminToken = buildAdminToken();
    const volunteer = await prisma.voluntario.create({
      data: {
        nombre: 'Lucia',
        email: 'lucia@example.com',
        telefono: '600123123',
      },
    });

    const createRes = await request(app)
      .post('/api/volunteers/appointments')
      .send({
        voluntarioId: volunteer.id,
        inicio: '2026-08-20T09:00:00.000Z',
        fin: '2026-08-20T11:00:00.000Z',
        estado: 'confirmada',
        notas: 'Apoyo en limpieza y recepción',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.voluntarioId).toBe(volunteer.id);
    expect(createRes.body.voluntario.nombre).toBe('Lucia');

    const listRes = await request(app).get('/api/volunteers/appointments');

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body).toHaveLength(1);
    expect(listRes.body[0].estado).toBe('confirmada');

    const updateRes = await request(app)
      .put(`/api/volunteers/appointments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        voluntarioId: volunteer.id,
        inicio: '2026-08-20T10:00:00.000Z',
        fin: '2026-08-20T12:00:00.000Z',
        estado: 'pendiente',
        notas: 'Horario pendiente de confirmación',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.estado).toBe('pendiente');
    expect(updateRes.body.notas).toContain('pendiente');

    const deleteRes = await request(app)
      .delete(`/api/volunteers/appointments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Cita de voluntariado eliminada correctamente');

    const dbAppointment = await prisma.citaVoluntariado.findUnique({
      where: { id: createRes.body.id },
    });

    expect(dbAppointment).toBeNull();
  });
});