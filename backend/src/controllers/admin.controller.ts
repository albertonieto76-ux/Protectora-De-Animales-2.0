import type { Request, Response } from "express";
import { gunzipSync } from "node:zlib";
import { prisma } from "../services/prisma.js";

const asDate = (value: unknown) => {
  if (!value && value !== 0) return undefined;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? value : date;
};

const normalizeBackupPayload = (payload: any) => ({
  animals: Array.isArray(payload?.animals) ? payload.animals : [],
  adoptions: Array.isArray(payload?.adoptions) ? payload.adoptions : [],
  volunteers: Array.isArray(payload?.volunteers) ? payload.volunteers : [],
  volunteerAppointments: Array.isArray(payload?.volunteerAppointments) ? payload.volunteerAppointments : [],
  events: Array.isArray(payload?.events) ? payload.events : [],
  eventAssistants: Array.isArray(payload?.eventAssistants) ? payload.eventAssistants : [],
  donations: Array.isArray(payload?.donations) ? payload.donations : [],
  paymentTypes: Array.isArray(payload?.paymentTypes) ? payload.paymentTypes : [],
  users: Array.isArray(payload?.users) ? payload.users : [],
  auditLogs: Array.isArray(payload?.auditLogs) ? payload.auditLogs : [],
});

const isBackupLikeObject = (payload: any) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const backupKeys = [
    "animals",
    "adoptions",
    "volunteers",
    "volunteerAppointments",
    "events",
    "eventAssistants",
    "donations",
    "paymentTypes",
    "users",
    "auditLogs",
  ];

  return backupKeys.some((key) => Array.isArray(payload[key])) || typeof payload.exportedAt === "string";
};

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
      prisma.solicitudAdopcion.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { animal: { select: { name: true } } },
      }).catch(() => []),
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

export const exportDatabaseBackup = async (_req: Request, res: Response) => {
  try {
    const [animals, adoptions, volunteers, volunteerAppointments, events, eventAssistants, donations, paymentTypes, users, auditLogs] = await Promise.all([
      prisma.animal.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.solicitudAdopcion.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.voluntario.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.citaVoluntariado.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.evento.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.asistenteEvento.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.donacion.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.tipoPago.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.usuario.findMany({ orderBy: { id: "asc" } }).catch(() => []),
      prisma.securityAuditLog.findMany({ orderBy: { id: "asc" } }).catch(() => []),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      animals,
      adoptions,
      volunteers,
      volunteerAppointments,
      events,
      eventAssistants,
      donations,
      paymentTypes,
      users,
      auditLogs,
    };

    const raw = JSON.stringify(payload, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", 'attachment; filename="protectora-backup.json"');
    if (typeof res.attachment === "function") {
      res.attachment("protectora-backup.json");
    }
    res.send(raw);
  } catch (error) {
    console.error("Error al exportar la base de datos:", error);
    res.status(500).json({ error: "Error al exportar la base de datos" });
  }
};

const decodeBackupBody = (body: unknown) => {
  if (Buffer.isBuffer(body)) {
    const buffer = body;
    const isGzip = buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
    const source = isGzip ? gunzipSync(buffer).toString("utf-8") : buffer.toString("utf-8");
    return JSON.parse(source);
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  return body;
};

export const importDatabaseBackup = async (req: Request, res: Response) => {
  try {
    const payload = decodeBackupBody(req.body);

    if (!isBackupLikeObject(payload)) {
      return res.status(400).json({ error: "No se recibió un backup válido para importar" });
    }

    const backup = normalizeBackupPayload(payload);

    const summary = await prisma.$transaction(async (tx: any) => {
      const counts = {
        paymentTypes: 0,
        users: 0,
        animals: 0,
        volunteers: 0,
        events: 0,
        adoptions: 0,
        volunteerAppointments: 0,
        eventAssistants: 0,
        donations: 0,
        auditLogs: 0,
      };

      await tx.securityAuditLog.deleteMany();
      if (backup.auditLogs.length) {
        for (const item of backup.auditLogs) {
          await tx.securityAuditLog.create({
            data: {
              ...item,
              createdAt: asDate(item.createdAt) ?? new Date(),
              metadata: item.metadata ?? null,
            },
          });
        }
      }
      counts.auditLogs = backup.auditLogs.length;

      await tx.donacion.deleteMany();
      await tx.tipoPago.deleteMany();
      if (backup.paymentTypes.length) {
        for (const item of backup.paymentTypes) {
          await tx.tipoPago.create({ data: { ...item } });
        }
      }
      counts.paymentTypes = backup.paymentTypes.length;

      await tx.usuario.deleteMany();
      if (backup.users.length) {
        for (const item of backup.users) {
          await tx.usuario.create({
            data: {
              ...item,
              mfaRecoveryCodes: Array.isArray(item.mfaRecoveryCodes) ? item.mfaRecoveryCodes : [],
            },
          });
        }
      }
      counts.users = backup.users.length;

      await tx.animal.deleteMany();
      if (backup.animals.length) {
        for (const item of backup.animals) {
          await tx.animal.create({
            data: {
              ...item,
              age: item.age === null || item.age === undefined ? null : Number(item.age),
              images: Array.isArray(item.images) ? item.images : [],
              createdAt: asDate(item.createdAt) ?? new Date(),
              updatedAt: asDate(item.updatedAt) ?? new Date(),
            },
          });
        }
      }
      counts.animals = backup.animals.length;

      await tx.voluntario.deleteMany();
      if (backup.volunteers.length) {
        for (const item of backup.volunteers) {
          await tx.voluntario.create({
            data: {
              ...item,
              createdAt: asDate(item.createdAt) ?? new Date(),
            },
          });
        }
      }
      counts.volunteers = backup.volunteers.length;

      await tx.evento.deleteMany();
      if (backup.events.length) {
        for (const item of backup.events) {
          await tx.evento.create({
            data: {
              ...item,
              images: Array.isArray(item.images) ? item.images : [],
              fecha: asDate(item.fecha) ?? new Date(),
              createdAt: asDate(item.createdAt) ?? new Date(),
            },
          });
        }
      }
      counts.events = backup.events.length;

      await tx.solicitudAdopcion.deleteMany();
      if (backup.adoptions.length) {
        for (const item of backup.adoptions) {
          await tx.solicitudAdopcion.create({
            data: {
              ...item,
              fechaCita: asDate(item.fechaCita),
              createdAt: asDate(item.createdAt) ?? new Date(),
              animalId: Number(item.animalId),
            },
          });
        }
      }
      counts.adoptions = backup.adoptions.length;

      await tx.citaVoluntariado.deleteMany();
      if (backup.volunteerAppointments.length) {
        for (const item of backup.volunteerAppointments) {
          await tx.citaVoluntariado.create({
            data: {
              ...item,
              inicio: asDate(item.inicio) ?? new Date(),
              fin: asDate(item.fin) ?? new Date(),
              createdAt: asDate(item.createdAt) ?? new Date(),
              voluntarioId: Number(item.voluntarioId),
            },
          });
        }
      }
      counts.volunteerAppointments = backup.volunteerAppointments.length;

      await tx.asistenteEvento.deleteMany();
      if (backup.eventAssistants.length) {
        for (const item of backup.eventAssistants) {
          await tx.asistenteEvento.create({
            data: {
              ...item,
              createdAt: asDate(item.createdAt) ?? new Date(),
              eventoId: Number(item.eventoId),
            },
          });
        }
      }
      counts.eventAssistants = backup.eventAssistants.length;

      if (backup.donations.length) {
        for (const item of backup.donations) {
          await tx.donacion.create({
            data: {
              ...item,
              cantidad: Number(item.cantidad),
              metodoId: item.metodoId === null || item.metodoId === undefined ? null : Number(item.metodoId),
              createdAt: asDate(item.createdAt) ?? new Date(),
            },
          });
        }
      }
      counts.donations = backup.donations.length;

      return counts;
    }, {
      maxWait: 10_000,
      timeout: 120_000,
    });

    for (const table of ["Voluntario", "CitaVoluntariado"]) {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM "${table}"), 1), 1), EXISTS(SELECT 1 FROM "${table}"))`,
      );
    }

    res.json({
      message: "Backup importado correctamente",
      imported: summary,
    });
  } catch (error) {
    console.error("Error al importar la base de datos:", error);
    res.status(500).json({ error: "Error al importar la base de datos" });
  }
};
