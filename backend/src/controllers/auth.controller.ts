import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { prisma } from "../services/prisma.js";
import { clearLoginFailures, registerLoginFailure } from "../middleware/authRateLimit.js";
import { auditFromRequest, auditLog } from "../services/securityAudit.service.js";
import { buildOtpAuthUrl, generateMfaSecret, verifyTotp } from "../utils/mfaTotp.js";
import { decryptSecret, encryptSecret } from "../utils/mfaCrypto.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = "8h";
const JWT_ISSUER = "protectora-backend";
const JWT_AUDIENCE = "protectora-admin";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};

const clearAdminCookies = (res: Response) => {
  const clearOptions = [
    { path: "/" },
    { path: "/api" },
  ];

  for (const options of clearOptions) {
    res.clearCookie("admin_token", options);
    res.clearCookie("csrf_token", options);
  }
};

const signAdminToken = (user: { id: number; role: string; email: string }) => {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
  });
};

const issueAdminSession = (res: Response, user: { id: number; role: string; email: string }) => {
  const token = signAdminToken(user);
  const csrfToken = createCsrfToken();

  res.cookie("admin_token", token, cookieOptions);
  res.cookie("csrf_token", csrfToken, csrfCookieOptions);

  return { token, csrfToken };
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const rateLimitKey = res.locals.loginRateLimitKey as string | undefined;

    if (!email || !password) {
      registerLoginFailure(rateLimitKey);
      await auditFromRequest(req, { action: "ADMIN_LOGIN_FAILED", success: false, reason: "missing_credentials" });
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail) || password.length < 8 || password.length > 256) {
      registerLoginFailure(rateLimitKey);
      await auditFromRequest(req, { action: "ADMIN_LOGIN_FAILED", success: false, reason: "invalid_credentials_format" });
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    const user = await prisma.usuario.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.role !== "admin") {
      registerLoginFailure(rateLimitKey);
      await auditFromRequest(req, { action: "ADMIN_LOGIN_FAILED", success: false, reason: "user_not_found_or_not_admin" });
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      registerLoginFailure(rateLimitKey);
      await auditLog({
        action: "ADMIN_LOGIN_FAILED",
        success: false,
        reason: "wrong_password",
        userId: user.id,
        email: user.email,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.header("user-agent") || null,
      });
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    clearLoginFailures(rateLimitKey);
    const { token, csrfToken } = issueAdminSession(res, { id: user.id, role: user.role, email: user.email });
    await auditLog({
      action: "ADMIN_LOGIN_SUCCESS",
      success: true,
      userId: user.id,
      email: user.email,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.header("user-agent") || null,
    });

    return res.json({ ok: true, message: "Inicio de sesión correcto", csrfToken, token });
  } catch (error) {
    console.error("Error en login admin:", error);
    await auditFromRequest(req, { action: "ADMIN_LOGIN_FAILED", success: false, reason: "server_error" });
    return res.status(500).json({ error: "No se pudo iniciar sesión" });
  }
};

export const logoutAdmin = (_req: Request, res: Response) => {
  clearAdminCookies(res);
  auditFromRequest(_req, { action: "ADMIN_LOGOUT", success: true }).catch(() => undefined);
  return res.json({ ok: true, message: "Sesión cerrada" });
};

const generateRecoveryCode = () => crypto.randomBytes(5).toString("hex").toUpperCase();

const createRecoveryCodes = async (count = 8) => {
  const plainCodes = Array.from({ length: count }, () => generateRecoveryCode());
  const hashedCodes = await Promise.all(plainCodes.map((code) => bcrypt.hash(code, 12)));
  return { plainCodes, hashedCodes };
};

const consumeRecoveryCode = async (hashedCodes: string[], candidateCode: string) => {
  const normalizedCode = String(candidateCode || "").trim().toUpperCase();
  for (let index = 0; index < hashedCodes.length; index += 1) {
    const matches = await bcrypt.compare(normalizedCode, hashedCodes[index]);
    if (matches) {
      return hashedCodes.filter((_, currentIndex) => currentIndex !== index);
    }
  }
  return null;
};

export const verifyAdminMfa = async (req: Request, res: Response) => {
  await auditFromRequest(req, { action: "ADMIN_MFA_VERIFY_DEPRECATED", success: false, reason: "mfa_flow_disabled" });
  return res.status(410).json({ error: "La verificación MFA ya no se usa en el login" });
};

export const setupAdminMfa = async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  if (!userId) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Permisos insuficientes" });
  }

  const secret = generateMfaSecret();
  const encrypted = encryptSecret(secret);
  await prisma.usuario.update({ where: { id: userId }, data: { mfaTempSecret: encrypted } });

  await auditFromRequest(req, { action: "ADMIN_MFA_SETUP", success: true });
  return res.json({ ok: true, secret, otpauthUrl: buildOtpAuthUrl(secret, user.email) });
};

export const enableAdminMfa = async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  const { code } = req.body as { code?: string };

  if (!userId || !code) {
    return res.status(400).json({ error: "Código MFA obligatorio" });
  }

  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user || !user.mfaTempSecret) {
    return res.status(400).json({ error: "Debes iniciar la configuración MFA" });
  }

  const secret = decryptSecret(user.mfaTempSecret);
  if (!verifyTotp(secret, code)) {
    await auditFromRequest(req, { action: "ADMIN_MFA_ENABLE_FAILED", success: false, reason: "invalid_totp" });
    return res.status(401).json({ error: "Código MFA inválido" });
  }

  const { plainCodes, hashedCodes } = await createRecoveryCodes();
  await prisma.usuario.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaSecret: encryptSecret(secret),
      mfaTempSecret: null,
      mfaRecoveryCodes: hashedCodes,
    },
  });

  await auditFromRequest(req, { action: "ADMIN_MFA_ENABLE", success: true });
  return res.json({ ok: true, message: "MFA activado", recoveryCodes: plainCodes });
};

export const disableAdminMfa = async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  const { code } = req.body as { code?: string };

  if (!userId || !code) {
    return res.status(400).json({ error: "Código MFA obligatorio" });
  }

  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user || !user.mfaSecret) {
    return res.status(400).json({ error: "MFA no está activado" });
  }

  const secret = decryptSecret(user.mfaSecret);
  if (!verifyTotp(secret, code)) {
    await auditFromRequest(req, { action: "ADMIN_MFA_DISABLE_FAILED", success: false, reason: "invalid_totp" });
    return res.status(401).json({ error: "Código MFA inválido" });
  }

  await prisma.usuario.update({ where: { id: userId }, data: { mfaEnabled: false, mfaSecret: null, mfaTempSecret: null, mfaRecoveryCodes: [] } });

  await auditFromRequest(req, { action: "ADMIN_MFA_DISABLE", success: true });
  return res.json({ ok: true, message: "MFA desactivado" });
};

export const regenerateAdminRecoveryCodes = async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  const { code } = req.body as { code?: string };

  if (!userId || !code) {
    return res.status(400).json({ error: "Código MFA obligatorio" });
  }

  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user || !user.mfaEnabled || !user.mfaSecret) {
    return res.status(400).json({ error: "MFA no está activado" });
  }

  const secret = decryptSecret(user.mfaSecret);
  if (!verifyTotp(secret, code)) {
    await auditFromRequest(req, { action: "ADMIN_MFA_RECOVERY_REGENERATE_FAILED", success: false, reason: "invalid_totp" });
    return res.status(401).json({ error: "Código MFA inválido" });
  }

  const { plainCodes, hashedCodes } = await createRecoveryCodes();
  await prisma.usuario.update({ where: { id: userId }, data: { mfaRecoveryCodes: hashedCodes } });

  await auditFromRequest(req, { action: "ADMIN_MFA_RECOVERY_REGENERATE", success: true });
  return res.json({ ok: true, recoveryCodes: plainCodes });
};

export const meAdmin = (req: Request, res: Response) => {
  const token = req.cookies?.admin_token || req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as { sub?: number | string; role?: string; email?: string };
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    const userId = Number(payload.sub);
    const sendPayload = (extra: Record<string, unknown> = {}) => res.json({
      ok: true,
      role: payload.role,
      email: payload.email,
      ...extra,
    });

    prisma.usuario.findUnique({ where: { id: userId } })
      .then(() => {
        if (!req.cookies?.csrf_token) {
          const csrfToken = createCsrfToken();
          res.cookie("csrf_token", csrfToken, csrfCookieOptions);
          return sendPayload({ csrfToken });
        }

        sendPayload();
      })
      .catch(() => {
        if (!req.cookies?.csrf_token) {
          const csrfToken = createCsrfToken();
          res.cookie("csrf_token", csrfToken, csrfCookieOptions);
          return res.json({ ok: true, role: payload.role, csrfToken });
        }
        return res.json({ ok: true, role: payload.role });
      });
    return;
  } catch {
    return res.status(401).json({ error: "Sesión inválida" });
  }
};

