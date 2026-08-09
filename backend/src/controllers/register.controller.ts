import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,128}$/;

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body as {
      nombre?: string;
      email?: string;
      password?: string;
    };

    const bootstrapKey = req.header("x-admin-bootstrap-key");
    const expectedBootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;

    if (!expectedBootstrapKey || bootstrapKey !== expectedBootstrapKey) {
      return res.status(403).json({ error: "Registro de administrador deshabilitado" });
    }

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener 12+ caracteres, mayúscula, minúscula, número y símbolo",
      });
    }

    const adminCount = await prisma.usuario.count({ where: { role: "admin" } });
    if (adminCount > 0) {
      return res.status(403).json({ error: "Ya existe un administrador. Usa el flujo autenticado." });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
      },
    });

    return res.status(201).json({ ok: true, id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    return res.status(500).json({ error: "No se pudo crear el usuario" });
  }
};
