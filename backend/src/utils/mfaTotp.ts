import crypto from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = (buffer: Buffer): string => {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let output = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }

  return output;
};

const base32Decode = (value: string): Buffer => {
  const clean = value.replace(/=+$/, "").toUpperCase();
  let bits = "";

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) {
      throw new Error("Secreto TOTP inválido");
    }
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
};

const generateTotpCode = (secretBase32: string, timestampMs: number): string => {
  const step = 30;
  const counter = Math.floor(timestampMs / 1000 / step);

  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const secret = base32Decode(secretBase32);
  const hmac = crypto.createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 1_000_000).padStart(6, "0");
};

export const generateMfaSecret = (): string => {
  const random = crypto.randomBytes(20);
  return base32Encode(random);
};

export const buildOtpAuthUrl = (secretBase32: string, email: string): string => {
  const issuer = "ProtectoraAdmin";
  const label = `${issuer}:${email}`;
  return `otpauth://totp/${encodeURIComponent(label)}?secret=${secretBase32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
};

export const verifyTotp = (secretBase32: string, code: string, window = 1): boolean => {
  const sanitizedCode = String(code || "").trim();
  if (!/^\d{6}$/.test(sanitizedCode)) {
    return false;
  }

  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const candidate = generateTotpCode(secretBase32, now + i * 30_000);
    if (candidate === sanitizedCode) {
      return true;
    }
  }

  return false;
};
