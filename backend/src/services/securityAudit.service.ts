import type { Request } from "express";
import { prisma } from "../services/prisma.js";

type AuditPayload = {
  action: string;
  success: boolean;
  reason?: string;
  userId?: number | null;
  email?: string | null;
  path?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

const clientIp = (req: Request) => {
  const forwarded = req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || null;
};

export const auditFromRequest = async (
  req: Request,
  payload: Omit<AuditPayload, "path" | "method" | "ip" | "userAgent" | "userId" | "email">,
) => {
  await auditLog({
    ...payload,
    userId: req.authUser?.id ?? null,
    email: req.authUser?.email ?? null,
    path: req.originalUrl,
    method: req.method,
    ip: clientIp(req),
    userAgent: req.header("user-agent") || null,
  });
};

export const auditLog = async (payload: AuditPayload) => {
  try {
    await prisma.securityAuditLog.create({
      data: {
        action: payload.action,
        success: payload.success,
        reason: payload.reason || null,
        userId: payload.userId ?? null,
        email: payload.email ?? null,
        path: payload.path || null,
        method: payload.method || null,
        ip: payload.ip || null,
        userAgent: payload.userAgent || null,
        metadata: payload.metadata || null,
      },
    });
  } catch (error) {
    console.error("No se pudo guardar registro de auditoria:", error);
  }
};
