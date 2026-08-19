import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// ── Mock del servicio de donaciones ────────────────────────────────────────
vi.mock("../../services/donations.service.ts");

import * as donationsService from "../../services/donations.service.ts";
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationController,
  deleteDonationController,
} from "../../controllers/donations.controller.ts";

// ── Helpers ────────────────────────────────────────────────────────────────
const makeRes = (): any => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const makeReq = (params: Record<string, string> = {}, body: Record<string, unknown> = {}): any => ({
  params,
  body,
});

// ── Tests ──────────────────────────────────────────────────────────────────
describe("Donations Controller", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getDonations ──────────────────────────────────────────────────────
  describe("getDonations", () => {
    it("devuelve lista de donaciones", async () => {
      const mockData = [{ id: 1, cantidad: 50, metodo: { tipo: "tarjeta" } }];
      vi.spyOn(donationsService, "findAllDonations").mockResolvedValue(mockData as any);

      const res = makeRes();
      await getDonations({} as Request, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it("devuelve 500 si el servicio lanza un error", async () => {
      vi.spyOn(donationsService, "findAllDonations").mockRejectedValue(new Error("DB error"));

      const res = makeRes();
      await getDonations({} as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener donaciones" });
    });
  });

  // ── getDonationById ───────────────────────────────────────────────────
  describe("getDonationById", () => {
    it("devuelve la donación si existe", async () => {
      const mockDonation = { id: 1, cantidad: 100, metodo: { tipo: "paypal" } };
      vi.spyOn(donationsService, "findDonationById").mockResolvedValue(mockDonation as any);

      const req = makeReq({ id: "1" });
      const res = makeRes();
      await getDonationById(req, res);

      expect(donationsService.findDonationById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockDonation);
    });

    it("devuelve 404 si no existe la donación", async () => {
      vi.spyOn(donationsService, "findDonationById").mockResolvedValue(null);

      const req = makeReq({ id: "999" });
      const res = makeRes();
      await getDonationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Donación no encontrada" });
    });

    it("devuelve 500 si el servicio lanza un error", async () => {
      vi.spyOn(donationsService, "findDonationById").mockRejectedValue(new Error("DB error"));

      const req = makeReq({ id: "1" });
      const res = makeRes();
      await getDonationById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al obtener donación" });
    });
  });

  // ── createDonation ────────────────────────────────────────────────────
  describe("createDonation", () => {
    it("crea una donación y devuelve 201", async () => {
      const newDonation = { id: 10, cantidad: 25, metodoId: 1 };
      vi.spyOn(donationsService, "createDonation").mockResolvedValue(newDonation as any);

      const req = makeReq({}, { cantidad: 25, metodoId: 1 });
      const res = makeRes();
      await createDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newDonation);
    });

    it("devuelve 500 si el servicio lanza un error", async () => {
      vi.spyOn(donationsService, "createDonation").mockRejectedValue(new Error("DB error"));

      const req = makeReq({}, { cantidad: 25, metodoId: 1 });
      const res = makeRes();
      await createDonation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al crear donación" });
    });
  });

  // ── updateDonationController ──────────────────────────────────────────
  describe("updateDonationController", () => {
    it("actualiza la donación y devuelve el resultado", async () => {
      const updated = { id: 1, cantidad: 75 };
      vi.spyOn(donationsService, "updateDonation").mockResolvedValue(updated as any);

      const req = makeReq({ id: "1" }, { cantidad: 75 });
      const res = makeRes();
      await updateDonationController(req, res);

      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("devuelve 404 si la donación no existe", async () => {
      vi.spyOn(donationsService, "updateDonation").mockResolvedValue(null);

      const req = makeReq({ id: "999" }, { cantidad: 75 });
      const res = makeRes();
      await updateDonationController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Donación no encontrada" });
    });

    it("devuelve 500 si el servicio lanza un error", async () => {
      vi.spyOn(donationsService, "updateDonation").mockRejectedValue(new Error("DB error"));

      const req = makeReq({ id: "1" }, { cantidad: 75 });
      const res = makeRes();
      await updateDonationController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al actualizar donación" });
    });
  });

  // ── deleteDonationController ──────────────────────────────────────────
  describe("deleteDonationController", () => {
    it("elimina la donación y devuelve mensaje de confirmación", async () => {
      vi.spyOn(donationsService, "deleteDonation").mockResolvedValue(true);

      const req = makeReq({ id: "1" });
      const res = makeRes();
      await deleteDonationController(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: "Donación eliminada correctamente" });
    });

    it("devuelve 404 si la donación no existe", async () => {
      vi.spyOn(donationsService, "deleteDonation").mockResolvedValue(false);

      const req = makeReq({ id: "999" });
      const res = makeRes();
      await deleteDonationController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Donación no encontrada" });
    });

    it("devuelve 500 si el servicio lanza un error", async () => {
      vi.spyOn(donationsService, "deleteDonation").mockRejectedValue(new Error("DB error"));

      const req = makeReq({ id: "1" });
      const res = makeRes();
      await deleteDonationController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Error al eliminar donación" });
    });
  });
});
