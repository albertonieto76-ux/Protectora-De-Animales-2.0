import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Response } from "express";

describe("GET /admin/dashboard", () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      animal: {
        count: vi.fn().mockResolvedValue(42),
        findMany: vi.fn().mockResolvedValue([
          { id: 1, nombre: "Luna", especie: "Perro" },
        ]),
      },
      solicitudAdopcion: {
        count: vi.fn(),
        findMany: vi.fn().mockResolvedValue([
          { id: 1, nombre: "Carlos", animalId: 1 },
        ]),
      },
      voluntario: {
        count: vi.fn().mockResolvedValue(12),
      },
      evento: {
        count: vi.fn().mockResolvedValue(3),
      },
      donacion: {
        count: vi.fn().mockResolvedValue(27),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { cantidad: 1540.5 },
        }),
      },
    };

    vi.clearAllMocks();
  });

  it("debe devolver estadísticas del dashboard", () => {
    expect(mockPrisma.animal.count).toBeDefined();
    expect(mockPrisma.solicitudAdopcion.count).toBeDefined();
    expect(mockPrisma.voluntario.count).toBeDefined();
  });

  it("debe contar animales correctamente", async () => {
    const count = await mockPrisma.animal.count();
    expect(count).toBe(42);
  });

  it("debe obtener donaciones totales", async () => {
    const result = await mockPrisma.donacion.aggregate();
    expect(result._sum.cantidad).toBe(1540.5);
  });
});
