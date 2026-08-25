import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime = "nodejs";

const hash = (value: string) => crypto.createHash("sha256").update(`${value}:${process.env.ADMIN_SESSION_SECRET || "portfolio"}`).digest("hex");

export async function POST(request: Request) {
  try {
    await ensurePortfolioSchema();
    const { email } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const ownerEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    if (!cleanEmail || !ownerEmail || cleanEmail !== ownerEmail) {
      return NextResponse.json({ success: true, message: "If the owner email matches, a recovery code has been sent." });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailAppPassword) return NextResponse.json({ error: "Email service is not configured." }, { status: 500 });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const id = crypto.randomUUID();
    await db.query(`INSERT INTO public.admin_password_resets(id,email,otp_hash,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '10 minutes')`, [id, cleanEmail, hash(otp)]);

    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailAppPassword } });
    await transporter.sendMail({ from: `"Vivek Bhatt Portfolio" <${gmailUser}>`, to: ownerEmail, subject: "Admin password recovery code", text: `Your portfolio admin password recovery code is ${otp}. It expires in 10 minutes.` });

    return NextResponse.json({ success: true, message: "If the owner email matches, a recovery code has been sent." });
  } catch (error) {
    console.error("Password reset request error", error);
    return NextResponse.json({ error: "Unable to start password recovery." }, { status: 500 });
  }
}
