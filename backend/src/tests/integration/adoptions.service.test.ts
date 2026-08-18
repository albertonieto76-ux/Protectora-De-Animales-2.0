import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import { getAllAdoptions, updateAdoption } from "../../services/adoption.service.ts";

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

  it("convierte la fecha de cita antes de actualizar la adopción", async () => {
    const fechaCita = "2026-08-26T08:30:00.000Z";
    prismaMock.solicitudAdopcion.update.mockResolvedValue({ id: 11, fechaCita: new Date(fechaCita) });

    await updateAdoption(11, { fechaCita });

    expect(prismaMock.solicitudAdopcion.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { fechaCita: new Date(fechaCita) },
    });
  });
});
