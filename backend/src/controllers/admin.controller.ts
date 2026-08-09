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

export const getSecurityAuditLogs = async (req: Request, res: Response) => {
  try {
    const requestedLimit = Number(req.query.limit || 100);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 100;

    const logs = await prisma.securityAuditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      items: logs,
      count: logs.length,
    });
  } catch (error) {
    console.error("Error al obtener logs de seguridad:", error);
    res.status(500).json({ error: "Error al obtener logs de seguridad" });
  }
};
