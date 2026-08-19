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

// Helper: crear un TipoPago y devolver su id
const seedPaymentType = async (tipo = 'tarjeta', label = 'Tarjeta de crédito') => {
  const tipoPago = await prisma.tipoPago.create({ data: { tipo, label } });
  return tipoPago.id;
};

describe('Donations E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a donation (POST /api/donations)', async () => {
    const metodoId = await seedPaymentType();

    const donationData = {
      cantidad: 50,
      metodoId,
      nombre: 'María García',
      email: 'maria@example.com',
    };

    const res = await request(app)
      .post('/api/donations')
      .send(donationData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.cantidad).toBe(donationData.cantidad);
    expect(res.body.nombre).toBe(donationData.nombre);
    expect(res.body).toHaveProperty('metodo');

    // Verificar en BD
    const dbDonation = await prisma.donacion.findUnique({
      where: { id: res.body.id },
    });
    expect(dbDonation).not.toBeNull();
    expect(dbDonation!.cantidad).toBe(donationData.cantidad);
  });

  it('should list all donations (GET /api/donations)', async () => {
    const metodoId = await seedPaymentType('paypal', 'PayPal');

    const created = await prisma.donacion.create({
      data: { cantidad: 100, metodoId, nombre: 'Carlos Ruiz', email: 'carlos@example.com' },
    });

    const res = await request(app).get('/api/donations');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(created.id);
    expect(res.body[0].cantidad).toBe(100);
    expect(res.body[0]).toHaveProperty('metodo');
  });

  it('should get a donation by ID (GET /api/donations/:id)', async () => {
    const metodoId = await seedPaymentType();

    const created = await prisma.donacion.create({
      data: { cantidad: 25, metodoId, nombre: 'Lucia' },
    });

    const res = await request(app).get(`/api/donations/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.cantidad).toBe(25);

    // ID inexistente
    const resNotFound = await request(app).get('/api/donations/9999');
    expect(resNotFound.status).toBe(404);
    expect(resNotFound.body).toEqual({ error: 'Donación no encontrada' });
  });

  it('should delete a donation (DELETE /api/donations/:id)', async () => {
    const adminToken = buildAdminToken();
    const metodoId = await seedPaymentType();

    const created = await prisma.donacion.create({
      data: { cantidad: 10, metodoId },
    });

    const res = await request(app)
      .delete(`/api/donations/${created.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Donación eliminada correctamente');

    // Verificar eliminado en BD
    const dbDonation = await prisma.donacion.findUnique({
      where: { id: created.id },
    });
    expect(dbDonation).toBeNull();
  });
});
