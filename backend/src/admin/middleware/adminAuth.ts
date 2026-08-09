import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
  const JWT_ISSUER = "protectora-backend";
  const JWT_AUDIENCE = "protectora-admin";

  if (!token) {
    res.status(401).json({ error: "Acceso no autorizado" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { sub?: number | string; role?: string; email?: string };
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Permisos insuficientes" });
      return;
    }
    req.authUser = {
      id: Number(payload.sub),
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
};
