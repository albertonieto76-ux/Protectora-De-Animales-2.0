import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../services/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = "8h";

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({ ok: true, message: "Inicio de sesión correcto" });
  } catch (error) {
    console.error("Error en login admin:", error);
    return res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
};

export const logoutAdmin = (_req: Request, res: Response) => {
  res.clearCookie("admin_token", { path: "/" });
  return res.json({ ok: true, message: "Sesión cerrada" });
};

export const meAdmin = (req: Request, res: Response) => {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    return res.json({ ok: true, role: payload.role });
  } catch {
    return res.status(401).json({ error: "Sesión inválida" });
  }
};
