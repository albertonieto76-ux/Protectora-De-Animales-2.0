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

describe('Events E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create an event (POST /api/events)', async () => {
    const adminToken = buildAdminToken();
    const eventData = {
      titulo: 'Feria de Adopción de Verano',
      descripcion: 'Ven a conocer a nuestros peludos listos para ser adoptados.',
      fecha: '2026-08-20T10:00:00.000Z',
      lugar: 'Parque Central'
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(eventData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.titulo).toBe(eventData.titulo);
    expect(res.body.descripcion).toBe(eventData.descripcion);
    // Since DateTime fields might be returned as string, check equivalence
    expect(new Date(res.body.fecha).toISOString()).toBe(new Date(eventData.fecha).toISOString());
    expect(res.body.lugar).toBe(eventData.lugar);

    // Verify it exists in database
    const dbEvent = await prisma.evento.findUnique({
      where: { id: res.body.id }
    });
    expect(dbEvent).not.toBeNull();
    expect(dbEvent!.titulo).toBe(eventData.titulo);
  });

  it('should list all events (GET /api/events)', async () => {
    const created = await prisma.evento.create({
      data: {
        titulo: 'Taller de Adopción Responsable',
        fecha: new Date('2026-09-01T17:00:00.000Z'),
        lugar: 'Centro Cívico'
      }
    });

    const res = await request(app).get('/api/events');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(created.id);
    expect(res.body[0].titulo).toBe('Taller de Adopción Responsable');
  });

  it('should get an event by ID (GET /api/events/:id)', async () => {
    const created = await prisma.evento.create({
      data: {
        titulo: 'Caminata Solidaria',
        fecha: new Date('2026-10-15T09:00:00.000Z')
      }
    });

    const res = await request(app).get(`/api/events/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Caminata Solidaria');

    // Test non-existing event
    const resNotFound = await request(app).get('/api/events/9999');
    expect(resNotFound.status).toBe(404);
  });

  it('should update an event (PUT /api/events/:id)', async () => {
    const adminToken = buildAdminToken();
    const created = await prisma.evento.create({
      data: {
        titulo: 'Charla Educativa',
        fecha: new Date('2026-11-05T18:00:00.000Z'),
        lugar: 'Biblioteca Municipal'
      }
    });

    const updateData = {
      titulo: 'Charla Educativa sobre Cuidado Animal',
      lugar: 'Salón de Actos de la Biblioteca'
    };

    const res = await request(app)
      .put(`/api/events/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe(updateData.titulo);
    expect(res.body.lugar).toBe(updateData.lugar);

    // Verify in database
    const dbEvent = await prisma.evento.findUnique({
      where: { id: created.id }
    });
    expect(dbEvent!.titulo).toBe(updateData.titulo);
    expect(dbEvent!.lugar).toBe(updateData.lugar);
  });

  it('should delete an event (DELETE /api/events/:id)', async () => {
    const adminToken = buildAdminToken();
    const created = await prisma.evento.create({
      data: {
        titulo: 'Evento Temporal',
        fecha: new Date('2026-12-01T12:00:00.000Z')
      }
    });

    const res = await request(app)
      .delete(`/api/events/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Evento eliminado correctamente');

    // Verify deleted in database
    const dbEvent = await prisma.evento.findUnique({
      where: { id: created.id }
    });
    expect(dbEvent).toBeNull();
  });
});
