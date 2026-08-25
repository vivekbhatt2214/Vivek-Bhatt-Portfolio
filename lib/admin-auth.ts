import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "portfolio_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "change-this-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createAdminToken() {
  const payload = `${Date.now()}:${crypto.randomUUID()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  const age = Date.now() - Number(payload.split(":")[0]);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE * 1000) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function isAdmin() {
  const store = await cookies();
  return verifyAdminToken(store.get(COOKIE)?.value);
}

export const adminCookie = COOKIE;
export const adminMaxAge = MAX_AGE;
