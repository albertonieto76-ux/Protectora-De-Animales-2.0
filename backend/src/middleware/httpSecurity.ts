import type { Request, Response, NextFunction } from "express";
import type { CorsOptions } from "cors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_EXEMPT_PATHS = new Set(["/api/auth/login"]);

export const getCorsOptions = (): CorsOptions => {
  const raw = process.env.CORS_ORIGINS || "http://localhost:5173";
  const allowed = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowed.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  };
};

export const setSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=() ");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");

  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
};

export const enforceCsrfForCookieAuth = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  if (CSRF_EXEMPT_PATHS.has(req.path)) {
    next();
    return;
  }

  const adminCookie = req.cookies?.admin_token;
  if (!adminCookie) {
    next();
    return;
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.header("X-CSRF-Token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ error: "Token CSRF inválido" });
    return;
  }

  next();
};
