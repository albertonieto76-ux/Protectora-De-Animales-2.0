import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../services/prisma.js";

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password } = req.body as {
      nombre?: string;
      email?: string;
      password?: string;
    };

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
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
