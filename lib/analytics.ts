import crypto from "node:crypto";

export function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getOrCreateCookieId(current?: string | null) {
  return current && /^[a-f0-9-]{16,80}$/i.test(current)
    ? current
    : crypto.randomUUID();
}
