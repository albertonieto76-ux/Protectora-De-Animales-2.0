import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

// Mock prisma BEFORE importing routes
import { prismaMock } from "./prisma.mock.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

// Import route after mocking
import adoptionRoutes from "../../routes/adoption.routes.ts";

const app = express();
app.use(express.json());
app.use((req, _res, next) => {
  req.cookies = req.cookies || {};
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) {
    req.cookies.admin_token = token;
  }
  next();
});
app.use("/adoptions", adoptionRoutes);

beforeEach(() => vi.clearAllMocks());

describe("Adopciones - Integración", () => {

  it("GET /adoptions devuelve lista de adopciones", async () => {
    prismaMock.solicitudAdopcion.findMany.mockResolvedValue([
      { id: 1, nombre: "Carlos", animalId: 3 }
    ]);

    const res = await request(app).get("/adoptions");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, nombre: "Carlos", animalId: 3 }
    ]);
  });

  it("POST /adoptions crea una adopción", async () => {
    prismaMock.animal.findUnique.mockResolvedValue({ id: 2 });
    prismaMock.solicitudAdopcion.create.mockResolvedValue({
      id: 1,
      nombre: "Ana",
      animalId: 2
    });

    const res = await request(app)
      .post("/adoptions")
      .send({ nombre: "Ana", animalId: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Ana",
      animalId: 2
    });
  });

  it("POST /adoptions rechaza una solicitud sin animal válido", async () => {
    const res = await request(app)
      .post("/adoptions")
      .send({ nombre: "Ana", email: "ana@example.com", mensaje: "Quiero adoptar" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/animal/i);
    expect(prismaMock.solicitudAdopcion.create).not.toHaveBeenCalled();
  });

  it("PUT /adoptions/:id actualiza una adopción", async () => {
    prismaMock.solicitudAdopcion.update.mockResolvedValue({
      id: 1,
      nombre: "Ana actualizada"
    });

    const token = jwt.sign(
      { sub: 1, role: "admin", email: "admin@example.com" },
      process.env.JWT_SECRET || "change-me-in-production",
      { issuer: "protectora-backend", audience: "protectora-admin" }
    );

    const res = await request(app)
      .put("/adoptions/1")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Ana actualizada" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      nombre: "Ana actualizada"
    });
  });

  it("DELETE /adoptions/:id elimina una adopción", async () => {
    prismaMock.solicitudAdopcion.delete.mockResolvedValue({});

    const token = jwt.sign(
      { sub: 1, role: "admin", email: "admin@example.com" },
      process.env.JWT_SECRET || "change-me-in-production",
      { issuer: "protectora-backend", audience: "protectora-admin" }
    );

    const res = await request(app)
      .delete("/adoptions/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Adopción eliminada correctamente" });
  });

});
