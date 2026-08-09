import type { Request, Response, NextFunction } from "express";

type Entry = {
  count: number;
  firstAttemptTs: number;
  blockUntilTs: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const BLOCK_MS = 15 * 60 * 1000;
const store = new Map<string, Entry>();

const getClientIp = (req: Request) => {
  const forwarded = req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

const keyFor = (req: Request) => `${getClientIp(req)}:login`;

const now = () => Date.now();

const getOrInitEntry = (key: string) => {
  const current = store.get(key);
  if (!current) {
    const entry: Entry = { count: 0, firstAttemptTs: now(), blockUntilTs: 0 };
    store.set(key, entry);
    return entry;
  }

  if (now() - current.firstAttemptTs > WINDOW_MS) {
    current.count = 0;
    current.firstAttemptTs = now();
    current.blockUntilTs = 0;
  }

  return current;
};

export const loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const key = keyFor(req);
  const entry = getOrInitEntry(key);

  if (entry.blockUntilTs > now()) {
    const waitSeconds = Math.ceil((entry.blockUntilTs - now()) / 1000);
    res.setHeader("Retry-After", String(waitSeconds));
    res.status(429).json({ error: "Demasiados intentos. Vuelve a intentarlo más tarde." });
    return;
  }

  res.locals.loginRateLimitKey = key;
  next();
};

export const registerLoginFailure = (key?: string) => {
  if (!key) return;
  const entry = getOrInitEntry(key);
  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockUntilTs = now() + BLOCK_MS;
  }
};

export const clearLoginFailures = (key?: string) => {
  if (!key) return;
  store.delete(key);
};
