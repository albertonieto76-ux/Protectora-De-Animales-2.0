import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("compatibilidad con el backend anterior", () => {
  it("expone la ruta de animales en /api/animals", async () => {
    const response = await request(app).get("/api/animals");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
