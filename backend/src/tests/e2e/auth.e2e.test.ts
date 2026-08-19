import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../app.ts';
import { resetDb } from './setup/resetDb.ts';
import { prisma } from '../../services/prisma.ts';

// ── Helper: crear usuario admin en BD ─────────────────────────────────────
const ADMIN_EMAIL = 'admin-e2e@protectora.com';
const ADMIN_PASSWORD = 'TestPass!E2E#99';

const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return prisma.usuario.create({
    data: {
      nombre: 'Admin E2E',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    },
  });
};

describe('Auth E2E Tests', { concurrent: false }, () => {
  beforeEach(async () => {
    await resetDb();
    // Seed admin después de limpiar la BD
    await seedAdmin();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────
  it('login correcto devuelve 200 con token y csrfToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, message: 'Inicio de sesión correcto' });
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('csrfToken');

    // Las cookies deben establecerse
    const cookies = res.headers['set-cookie'] as string[];
    const tokenCookie = cookies?.find((c: string) => c.startsWith('admin_token='));
    expect(tokenCookie).toBeDefined();
  });

  it('login con contraseña incorrecta devuelve 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: 'WrongPassword!99' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas' });
  });

  it('login sin email ni password devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email y contraseña son obligatorios' });
  });

  it('login con email de usuario inexistente devuelve 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@example.com', password: 'SomePass!123' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Credenciales inválidas' });
  });

  // ── GET /api/auth/me ──────────────────────────────────────────────────
  it('GET /me con token válido devuelve 200 con role y email', async () => {
    // Primero hacemos login para obtener un token real
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    const { token } = loginRes.body;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, role: 'admin', email: ADMIN_EMAIL });
  });

  it('GET /me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No autenticado' });
  });

  // ── POST /api/auth/logout ─────────────────────────────────────────────
  it('logout devuelve 200 y limpia las cookies', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, message: 'Sesión cerrada' });

    // Verificar que las cookies se limpian (Set-Cookie con valor vacío y maxAge=0)
    const cookies = res.headers['set-cookie'] as string[];
    if (cookies) {
      const adminCookieCleared = cookies.some(
        (c: string) => c.startsWith('admin_token=;') || c.includes('Max-Age=0') || c.includes('Expires=')
      );
      expect(adminCookieCleared).toBe(true);
    }
  });
});
