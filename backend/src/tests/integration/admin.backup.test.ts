import { beforeEach, describe, expect, it, vi } from "vitest";
import { gzipSync } from "node:zlib";
import { exportDatabaseBackup, importDatabaseBackup } from "../../controllers/admin.controller.ts";
import { prisma } from "../../services/prisma.ts";

vi.mock("../../services/prisma.ts", () => ({
  prisma: {
    $transaction: vi.fn(),
    $executeRawUnsafe: vi.fn().mockResolvedValue(1),
    animal: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    solicitudAdopcion: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    voluntario: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    citaVoluntariado: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    evento: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    asistenteEvento: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    donacion: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    tipoPago: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    usuario: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    securityAuditLog: { findMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
  },
}));

describe("Admin backup controllers", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {}, query: {} };
    res = {
      setHeader: vi.fn(),
      attachment: vi.fn(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  it("exportDatabaseBackup debe incluir las fotos en el JSON exportado", async () => {
    vi.mocked(prisma.animal.findMany).mockResolvedValue([
      { id: 1, name: "Luna", species: "Perro", age: 3, description: "desc", images: ["data:image/png;base64,AAA"], createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-02") },
    ] as any);
    vi.mocked(prisma.solicitudAdopcion.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.voluntario.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.citaVoluntariado.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.evento.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.asistenteEvento.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.tipoPago.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.usuario.findMany).mockResolvedValue([] as any);
    vi.mocked(prisma.securityAuditLog.findMany).mockResolvedValue([] as any);

    await exportDatabaseBackup(req, res);

    expect(res.attachment).toHaveBeenCalledWith("protectora-backup.json");
    expect(res.send).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(res.send.mock.calls[0][0]);
    expect(payload.animals[0].images[0]).toContain("data:image/png;base64");
  });

  it("importDatabaseBackup debe aceptar un backup y restaurar los datos", async () => {
    const tx = {
      securityAuditLog: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      donacion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      solicitudAdopcion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      asistenteEvento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      citaVoluntariado: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      animal: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      evento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      voluntario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      usuario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      tipoPago: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(tx));

    req.body = {
      animals: [{
        id: 1,
        name: "Luna",
        species: "Perro",
        age: 3,
        description: "desc",
        images: ["data:image/png;base64,AAA"],
      }],
      events: [],
      volunteers: [],
      adoptions: [],
      donations: [],
      paymentTypes: [],
      users: [],
      auditLogs: [],
    };

    await importDatabaseBackup(req, res);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(prisma.$transaction).mock.calls[0][1]).toEqual({
      maxWait: 10_000,
      timeout: 120_000,
    });
    expect(tx.donacion.deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      tx.tipoPago.deleteMany.mock.invocationCallOrder[0]
    );
    expect(prisma.$executeRawUnsafe).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      imported: expect.objectContaining({ animals: 1 }),
    }));
  });

  it("importDatabaseBackup debe aceptar un backup vacío generado por la propia exportación", async () => {
    const tx = {
      securityAuditLog: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      donacion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      solicitudAdopcion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      asistenteEvento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      citaVoluntariado: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      animal: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      evento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      voluntario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      usuario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      tipoPago: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(tx));

    req.body = {
      exportedAt: "2026-08-14T00:00:00.000Z",
      animals: [],
      adoptions: [],
      volunteers: [],
      volunteerAppointments: [],
      events: [],
      eventAssistants: [],
      donations: [],
      paymentTypes: [],
      users: [],
      auditLogs: [],
    };

    await importDatabaseBackup(req, res);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Backup importado correctamente",
    }));
  });

  it("importDatabaseBackup debe aceptar un backup comprimido con gzip", async () => {
    const tx = {
      securityAuditLog: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      donacion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      solicitudAdopcion: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      asistenteEvento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      citaVoluntariado: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      animal: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      evento: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      voluntario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      usuario: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
      tipoPago: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), create: vi.fn() },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(tx));

    const payload = {
      exportedAt: "2026-08-14T00:00:00.000Z",
      animals: [],
      adoptions: [],
      volunteers: [],
      volunteerAppointments: [],
      events: [],
      eventAssistants: [],
      donations: [],
      paymentTypes: [],
      users: [],
      auditLogs: [],
    };

    req.body = gzipSync(Buffer.from(JSON.stringify(payload)));
    req.headers = { "content-type": "application/gzip" };

    await importDatabaseBackup(req, res);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Backup importado correctamente",
    }));
  });
});
