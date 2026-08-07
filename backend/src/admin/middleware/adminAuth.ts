import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

  if (!token) {
    res.status(401).json({ error: "Acceso no autorizado" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (payload.role !== "admin") {
      res.status(403).json({ error: "Permisos insuficientes" });
      return;
    }
    next();
  } catch {
    res.status(401).json({ error: "Sesión inválida o expirada" });
  }
};
