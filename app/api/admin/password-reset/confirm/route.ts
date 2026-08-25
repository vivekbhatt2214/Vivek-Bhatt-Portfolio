import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime = "nodejs";

const hash = (value: string) => crypto.createHash("sha256").update(`${value}:${process.env.ADMIN_SESSION_SECRET || "portfolio"}`).digest("hex");

function passwordHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export async function POST(request: Request) {
  try {
    await ensurePortfolioSchema();
    const { email, otp, newPassword } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();
    const password = String(newPassword || "");
    const ownerEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    if (cleanEmail !== ownerEmail || !/^\d{6}$/.test(cleanOtp) || password.length < 8) return NextResponse.json({ error: "Invalid recovery details." }, { status: 400 });

    const result = await db.query(`SELECT id,otp_hash FROM public.admin_password_resets WHERE email=$1 AND used=FALSE AND expires_at>NOW() ORDER BY created_at DESC LIMIT 1`, [cleanEmail]);
    if (!result.rowCount || result.rows[0].otp_hash !== hash(cleanOtp)) return NextResponse.json({ error: "Invalid or expired recovery code." }, { status: 400 });

    await db.query(`INSERT INTO public.admin_password_credentials(id,password_hash) VALUES(1,$1) ON CONFLICT(id) DO UPDATE SET password_hash=EXCLUDED.password_hash,updated_at=NOW()`, [passwordHash(password)]);
    await db.query(`UPDATE public.admin_password_resets SET used=TRUE WHERE id=$1`, [result.rows[0].id]);

    return NextResponse.json({ success: true, message: "Password created successfully." });
  } catch (error) {
    console.error("Password reset confirm error", error);
    return NextResponse.json({ error: "Unable to reset password." }, { status: 500 });
  }
}
