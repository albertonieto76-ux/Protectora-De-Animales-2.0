import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import { getAllAdoptions } from "../../services/adoption.service.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

describe("Adoptions Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllAdoptions devuelve adopciones", async () => {
    const mockData = [{ id: 1, nombre: "Carlos" }];
    prismaMock.solicitudAdopcion.findMany.mockResolvedValue(mockData);

    const result = await getAllAdoptions();

    expect(result).toEqual(mockData);
    expect(prismaMock.solicitudAdopcion.findMany).toHaveBeenCalled();
  });
});
