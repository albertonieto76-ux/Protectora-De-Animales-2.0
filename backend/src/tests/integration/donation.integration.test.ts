import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

// ── Mock prisma ANTES de importar las rutas ────────────────────────────────
import { prismaMock } from "./prisma.mock.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock,
}));

// Mock del audit de acciones críticas para no depender de BD en estos tests
vi.mock("../../services/securityAudit.service.ts", () => ({
  auditFromRequest: vi.fn().mockResolvedValue(undefined),
  auditLog: vi.fn().mockResolvedValue(undefined),
}));

// ── Importar rutas DESPUÉS de mockear ─────────────────────────────────────
import donationRoutes from "../../routes/donations.routes.ts";

// ── App de test ────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
// Simular cookies de admin para que adminAuth no bloquee rutas protegidas
app.use((req, _res, next) => {
  req.cookies = req.cookies || {};
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) {
    req.cookies.admin_token = token;
  }
  next();
});
app.use("/donations", donationRoutes);

const buildAdminToken = () =>
  jwt.sign(
    { sub: 1, role: "admin", email: "admin@protectora.com" },
    process.env.JWT_SECRET || "change-me-in-production",
    { issuer: "protectora-backend", audience: "protectora-admin" }
  );

beforeEach(() => vi.clearAllMocks());

// ── Tests ──────────────────────────────────────────────────────────────────
describe("Donaciones - Integración", () => {

  it("GET /donations devuelve lista de donaciones", async () => {
    prismaMock.donacion.findMany.mockResolvedValue([
      { id: 1, cantidad: 50, metodo: { tipo: "tarjeta", label: "Tarjeta" } },
    ]);

    const res = await request(app).get("/donations");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, cantidad: 50, metodo: { tipo: "tarjeta", label: "Tarjeta" } },
    ]);
  });

  it("GET /donations/:id devuelve la donación si existe", async () => {
    prismaMock.donacion.findUnique.mockResolvedValue({
      id: 3, cantidad: 100, metodo: { tipo: "paypal", label: "PayPal" },
    });

    const res = await request(app).get("/donations/3");

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(3);
    expect(res.body.cantidad).toBe(100);
  });

  it("GET /donations/:id devuelve 404 si no existe", async () => {
    prismaMock.donacion.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/donations/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Donación no encontrada" });
  });

  it("POST /donations crea una donación correctamente", async () => {
    prismaMock.donacion.create.mockResolvedValue({
      id: 10, cantidad: 25, metodoId: 1, metodo: { tipo: "tarjeta", label: "Tarjeta" },
    });

    const res = await request(app)
      .post("/donations")
      .send({ cantidad: 25, metodoId: 1, nombre: "Ana López" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(10);
    expect(res.body.cantidad).toBe(25);
  });

  it("PUT /donations/:id actualiza una donación (requiere admin token)", async () => {
    const adminToken = buildAdminToken();
    prismaMock.donacion.update.mockResolvedValue({
      id: 1, cantidad: 75, metodo: { tipo: "tarjeta", label: "Tarjeta" },
    });

    const res = await request(app)
      .put("/donations/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ cantidad: 75 });

    expect(res.status).toBe(200);
    expect(res.body.cantidad).toBe(75);
  });

  it("DELETE /donations/:id elimina una donación (requiere admin token)", async () => {
    const adminToken = buildAdminToken();
    prismaMock.donacion.delete.mockResolvedValue({});

    const res = await request(app)
      .delete("/donations/1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Donación eliminada correctamente" });
  });

  it("PUT /donations/:id devuelve 401 sin token de admin", async () => {
    const res = await request(app)
      .put("/donations/1")
      .send({ cantidad: 75 });

    expect(res.status).toBe(401);
  });

  it("DELETE /donations/:id devuelve 401 sin token de admin", async () => {
    const res = await request(app).delete("/donations/1");

    expect(res.status).toBe(401);
  });

  it("GET /donations devuelve 500 si Prisma falla", async () => {
    prismaMock.donacion.findMany.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/donations");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Error al obtener donaciones" });
  });
});
