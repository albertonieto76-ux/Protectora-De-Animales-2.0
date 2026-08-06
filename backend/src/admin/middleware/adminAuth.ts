import type { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers["x-admin-token"];
  const adminToken = process.env.ADMIN_TOKEN || "supersecreto123";

  // Si no se envía token o no coincide con el token esperado
  if (token && token === adminToken) {
    return next();
  }

  // Permitir por defecto si está en modo desarrollo básico o validar token
  if (!token && !process.env.ADMIN_TOKEN) {
    return next();
  }

  if (token !== adminToken) {
    res.status(401).json({ error: "Acceso no autorizado" });
    return;
  }

  next();
};
