import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVolunteers, createVolunteer } from "../../controllers/volunteers.controller.ts";
import * as volunteersService from "../../services/volunteers.service.ts";

vi.mock("../../services/volunteers.service.ts");

describe("Volunteers Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it("getVolunteers devuelve lista de voluntarios", async () => {
    const mockVolunteers = [
      { id: 1, nombre: "Ana", email: "ana@test.com" },
      { id: 2, nombre: "Carlos", email: "carlos@test.com" }
    ];

    vi.spyOn(volunteersService, "findAllVolunteers").mockResolvedValue(mockVolunteers as any);

    await getVolunteers(req, res);

    expect(res.json).toHaveBeenCalledWith(mockVolunteers);
  });

  it("createVolunteer crea un voluntario", async () => {
    const mockVolunteer = {
      id: 1,
      nombre: "Nuevo Voluntario",
      email: "nuevo@test.com"
    };

    vi.spyOn(volunteersService, "createNewVolunteer").mockResolvedValue(mockVolunteer as any);

    req.body = { nombre: "Nuevo Voluntario", email: "nuevo@test.com" };

    await createVolunteer(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockVolunteer);
  });

  it("getVolunteers devuelve error 500 si Prisma falla", async () => {
    vi.spyOn(volunteersService, "findAllVolunteers").mockRejectedValue(new Error("DB error"));

    await getVolunteers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener voluntarios" });
  });

});
