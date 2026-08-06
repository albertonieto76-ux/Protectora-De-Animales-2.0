import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminAuth } from "../../admin/middleware/adminAuth.ts";
import type { Request, Response, NextFunction } from "express";

describe("adminAuth middleware", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {} } as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any as Response;
    next = vi.fn() as NextFunction;
    process.env.ADMIN_TOKEN = "supersecreto123";
    vi.clearAllMocks();
  });

  it("permite acceso con token válido", () => {
    req.headers["x-admin-token"] = "supersecreto123";

    adminAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("bloquea acceso sin token", () => {
    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Acceso no autorizado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("bloquea acceso con token inválido", () => {
    req.headers["x-admin-token"] = "tokeninvalido";

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
