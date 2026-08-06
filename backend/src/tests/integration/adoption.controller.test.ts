import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdoptions,
  getAdoption,
  createAdoptionController as createAdoption,
  updateAdoptionController,
  deleteAdoptionController
} from "../../controllers/adoption.controller.ts";
import * as adoptionService from "../../services/adoption.service.ts";

vi.mock("../../services/adoption.service.ts");

describe("Adoption Controller", () => {
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

  it("getAdoptions devuelve lista de adopciones", async () => {
    const mockAdoptions = [
      { id: 1, nombre: "Carlos", animalId: 3 },
      { id: 2, nombre: "Ana", animalId: 1 }
    ];
    vi.spyOn(adoptionService, "getAllAdoptions").mockResolvedValue(mockAdoptions as any);

    await getAdoptions(req, res);

    expect(res.json).toHaveBeenCalledWith(mockAdoptions);
  });

  it("getAdoption devuelve una adopción por ID", async () => {
    const mockAdoption = { id: 1, nombre: "Carlos", animalId: 3 };
    vi.spyOn(adoptionService, "getAdoptionById").mockResolvedValue(mockAdoption as any);

    req.params = { id: "1" };

    await getAdoption(req, res);

    expect(res.json).toHaveBeenCalledWith(mockAdoption);
  });

  it("createAdoption crea una adopción", async () => {
    const mockAdoption = { id: 1, nombre: "Nuevo adoptante", animalId: 5 };
    vi.spyOn(adoptionService, "createAdoption").mockResolvedValue(mockAdoption as any);

    req.body = { nombre: "Nuevo adoptante", animalId: 5 };

    await createAdoption(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockAdoption);
  });

  it("updateAdoptionController actualiza una adopción", async () => {
    const mockAdoption = { id: 1, nombre: "Actualizado", animalId: 5 };
    vi.spyOn(adoptionService, "updateAdoption").mockResolvedValue(mockAdoption as any);

    req.params = { id: "1" };
    req.body = { nombre: "Actualizado" };

    await updateAdoptionController(req, res);

    expect(res.json).toHaveBeenCalledWith(mockAdoption);
  });

  it("deleteAdoptionController elimina una adopción", async () => {
    vi.spyOn(adoptionService, "deleteAdoption").mockResolvedValue(true as any);

    req.params = { id: "1" };

    await deleteAdoptionController(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: "Adopción eliminada correctamente"
    });
  });

  it("getAdoptions devuelve error 500 si Prisma falla", async () => {
    vi.spyOn(adoptionService, "getAllAdoptions").mockRejectedValue(new Error("DB error"));

    await getAdoptions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Error al obtener adopciones"
    });
  });

});
