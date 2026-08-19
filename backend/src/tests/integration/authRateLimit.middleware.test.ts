import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loginRateLimit,
  registerLoginFailure,
  clearLoginFailures,
} from "../../middleware/authRateLimit.ts";
import type { Request, Response, NextFunction } from "express";

// ── Helpers ────────────────────────────────────────────────────────────────
const makeReq = (ip = "127.0.0.1"): any => ({
  ip,
  header: vi.fn(() => undefined), // no X-Forwarded-For
});

const makeRes = (): any => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  setHeader: vi.fn(),
  locals: {} as Record<string, unknown>,
});

// ── Tests ──────────────────────────────────────────────────────────────────
describe("authRateLimit middleware", () => {

  // Limpiar el estado interno entre tests usando una IP única por bloque
  let testIp: string;
  let callCount = 0;

  beforeEach(() => {
    callCount++;
    testIp = `10.0.0.${callCount}`;
  });

  it("loginRateLimit permite la primera petición y llama a next()", () => {
    const req = makeReq(testIp);
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    loginRateLimit(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("loginRateLimit establece la clave en res.locals", () => {
    const req = makeReq(testIp);
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    loginRateLimit(req, res, next);

    expect(res.locals.loginRateLimitKey).toBe(`${testIp}:login`);
  });

  it("registerLoginFailure incrementa el contador; tras MAX_ATTEMPTS devuelve 429", () => {
    const req = makeReq(testIp);
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    // Primera pasada — permitida
    loginRateLimit(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    const key = `${testIp}:login`;

    // Simular 8 fallos (MAX_ATTEMPTS)
    for (let i = 0; i < 8; i++) {
      registerLoginFailure(key);
    }

    // Ahora la siguiente petición debe ser bloqueada
    const res2 = makeRes();
    const next2 = vi.fn() as NextFunction;
    loginRateLimit(req, res2, next2);

    expect(next2).not.toHaveBeenCalled();
    expect(res2.status).toHaveBeenCalledWith(429);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining("intentos") })
    );
    expect(res2.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
  });

  it("clearLoginFailures reinicia el contador y vuelve a permitir peticiones", () => {
    const req = makeReq(testIp);
    const res = makeRes();
    const next = vi.fn() as NextFunction;

    loginRateLimit(req, res, next);
    const key = `${testIp}:login`;

    // Forzar bloqueo
    for (let i = 0; i < 8; i++) {
      registerLoginFailure(key);
    }

    // Verificar que está bloqueado
    const res2 = makeRes();
    const next2 = vi.fn() as NextFunction;
    loginRateLimit(req, res2, next2);
    expect(next2).not.toHaveBeenCalled();

    // Limpiar el bloqueo
    clearLoginFailures(key);

    // Ahora debe volver a permitir
    const res3 = makeRes();
    const next3 = vi.fn() as NextFunction;
    loginRateLimit(req, res3, next3);

    expect(next3).toHaveBeenCalledTimes(1);
    expect(res3.status).not.toHaveBeenCalled();
  });

  it("registerLoginFailure no lanza error si key es undefined", () => {
    expect(() => registerLoginFailure(undefined)).not.toThrow();
  });

  it("clearLoginFailures no lanza error si key es undefined", () => {
    expect(() => clearLoginFailures(undefined)).not.toThrow();
  });
});
