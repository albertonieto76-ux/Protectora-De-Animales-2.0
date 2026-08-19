import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import {
  findAllDonations,
  findDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from "../../services/donations.service.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock,
}));

describe("Donations Service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("findAllDonations devuelve lista de donaciones", async () => {
    const mockData = [
      { id: 1, cantidad: 50, metodo: { tipo: "tarjeta", label: "Tarjeta" } },
    ];
    prismaMock.donacion.findMany.mockResolvedValue(mockData);

    const result = await findAllDonations();

    expect(result).toEqual(mockData);
    expect(prismaMock.donacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { metodo: true } })
    );
  });

  it("findDonationById devuelve la donación si existe", async () => {
    const mockDonation = { id: 5, cantidad: 100, metodo: { tipo: "paypal" } };
    prismaMock.donacion.findUnique.mockResolvedValue(mockDonation);

    const result = await findDonationById(5);

    expect(result).toEqual(mockDonation);
    expect(prismaMock.donacion.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    );
  });

  it("findDonationById devuelve null si no existe", async () => {
    prismaMock.donacion.findUnique.mockResolvedValue(null);

    const result = await findDonationById(999);

    expect(result).toBeNull();
  });

  it("createDonation convierte cantidad y metodoId a Number antes de guardar", async () => {
    const mockCreated = { id: 10, cantidad: 25, metodoId: 1 };
    prismaMock.donacion.create.mockResolvedValue(mockCreated);

    const result = await createDonation({ cantidad: "25", metodoId: "1", nombre: "Ana" });

    expect(result).toEqual(mockCreated);
    expect(prismaMock.donacion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cantidad: 25, metodoId: 1 }),
      })
    );
  });

  it("updateDonation actualiza la donación y devuelve el resultado", async () => {
    const mockUpdated = { id: 1, cantidad: 75 };
    prismaMock.donacion.update.mockResolvedValue(mockUpdated);

    const result = await updateDonation(1, { cantidad: "75" });

    expect(result).toEqual(mockUpdated);
    expect(prismaMock.donacion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ cantidad: 75 }),
      })
    );
  });

  it("updateDonation devuelve null si Prisma lanza un error", async () => {
    prismaMock.donacion.update.mockRejectedValue(new Error("not found"));

    const result = await updateDonation(999, { cantidad: 50 });

    expect(result).toBeNull();
  });

  it("deleteDonation elimina y devuelve true", async () => {
    prismaMock.donacion.delete.mockResolvedValue({});

    const result = await deleteDonation(1);

    expect(result).toBe(true);
    expect(prismaMock.donacion.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("deleteDonation devuelve false si Prisma lanza un error", async () => {
    prismaMock.donacion.delete.mockRejectedValue(new Error("not found"));

    const result = await deleteDonation(999);

    expect(result).toBe(false);
  });
});
