import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import { findAllVolunteers } from "../../services/volunteers.service.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

describe("Volunteers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllVolunteers devuelve voluntarios", async () => {
    prismaMock.voluntario.findMany.mockResolvedValue([
      { id: 1, nombre: "Ana" }
    ]);

    const result = await findAllVolunteers();

    expect(result).toEqual([{ id: 1, nombre: "Ana" }]);
    expect(prismaMock.voluntario.findMany).toHaveBeenCalled();
  });
});
