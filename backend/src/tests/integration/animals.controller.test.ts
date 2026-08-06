import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";
import { getAnimals } from "../../controllers/animals.controller.ts";
import * as animalsService from "../../services/animals.service.ts";
import { prismaMock } from "./prisma.mock.ts";

describe("getAnimals controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    } as any as Response;
    vi.clearAllMocks();
  });

  it("debe devolver lista de animales", async () => {
    const mockAnimals = [
      { id: 1, nombre: "Luna", especie: "Perro" },
      { id: 2, nombre: "Max", especie: "Gato" },
    ];

    vi.spyOn(animalsService, "findAllAnimals").mockResolvedValue(mockAnimals as any);

    await getAnimals(req, res);

    expect(res.json).toHaveBeenCalledWith(mockAnimals);
  });

  it("debe manejar errores al obtener animales", async () => {
    vi.spyOn(animalsService, "findAllAnimals").mockRejectedValue(
      new Error("Database error")
    );

    await getAnimals(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener animales" });
  });
});
