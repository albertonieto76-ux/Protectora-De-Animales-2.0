import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("rutas del backend migrado", () => {
  it("devuelve la lista de adopciones en /api/adoptions", async () => {
    const response = await request(app).get("/api/adoptions");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("devuelve la lista de voluntarios en /api/volunteers", async () => {
    const response = await request(app).get("/api/volunteers");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("devuelve la lista de eventos en /api/events", async () => {
    const response = await request(app).get("/api/events");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
