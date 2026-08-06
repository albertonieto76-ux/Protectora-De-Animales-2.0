import type { Request, Response } from "express";
import { prisma } from "../services/prisma.js";

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalAnimals,
      totalAdoptions,
      pendingAdoptions,
      totalVolunteers,
      upcomingEvents,
      totalDonations,
      donationsAgg,
      latestAnimals,
      latestAdoptions,
    ] = await Promise.all([
      prisma.animal.count().catch(() => 0),
      prisma.solicitudAdopcion.count().catch(() => 0),
      prisma.solicitudAdopcion.count({ where: { estado: "pendiente" } }).catch(() => 0),
      prisma.voluntario.count().catch(() => 0),
      prisma.evento.count().catch(() => 0),
      prisma.donacion.count().catch(() => 0),
      prisma.donacion.aggregate({ _sum: { cantidad: true } }).catch(() => ({ _sum: { cantidad: 0 } })),
      prisma.animal.findMany({ take: 5, orderBy: { createdAt: "desc" } }).catch(() => []),
      prisma.solicitudAdopcion.findMany({ take: 5, orderBy: { createdAt: "desc" } }).catch(() => []),
    ]);

    res.json({
      totalAnimals,
      totalAdoptions,
      pendingAdoptions,
      totalVolunteers,
      upcomingEvents,
      totalDonations,
      totalDonationsAmount: donationsAgg._sum.cantidad || 0,
      latestAnimals,
      latestAdoptions,
    });
  } catch (error) {
    console.error("Error al obtener datos de admin dashboard:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
};
