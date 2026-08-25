import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import crypto from "node:crypto";
import { ensurePortfolioSchema } from "@/lib/schema";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    await ensurePortfolioSchema();
    const body = await req.json();
    const id = String(body.id || "").trim();
    const otp = String(body.otp || body.code || "").trim();

    if (!id || !otp) return NextResponse.json({ error: "Verification ID and OTP are required." }, { status: 400 });
    if (!/^\d{6}$/.test(otp)) return NextResponse.json({ error: "Please enter a valid 6-digit OTP." }, { status: 400 });

    const result = await db.query(`SELECT id,name,email,reason,message,"verificationCode",verified FROM public.contactmessage WHERE id=$1 LIMIT 1`, [id]);
    if (!result.rowCount) return NextResponse.json({ error: "Verification request not found. Please submit the contact form again." }, { status: 404 });

    const record = result.rows[0];
    if (record.verified === true) return NextResponse.json({ success: true, verified: true, message: "Email is already verified." });
    if (String(record.verificationCode) !== otp) return NextResponse.json({ error: "Invalid verification code. Please check the OTP and try again." }, { status: 400 });

    await db.query(`UPDATE public.contactmessage SET verified=TRUE,"verificationCode"=NULL WHERE id=$1`, [id]);
    await db.query(`INSERT INTO analytics_events (id,event_type,session_id,page_path,metadata) VALUES ($1,$2,$3,$4,$5::jsonb)`, [crypto.randomUUID(), "verified_contact", `contact-${id}`, "/portfolio#contact", JSON.stringify({ contactId: id })]);

    // Send the verified contact request to the portfolio owner's inbox. The
    // Message-ID is stored so a later admin reply can use Gmail's native
    // In-Reply-To / References headers and appear as a real email thread.
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || gmailUser;
    const ownerEmail = process.env.OWNER_EMAIL || gmailUser;

    if (gmailUser && gmailAppPassword && fromEmail && ownerEmail) {
      try {
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: gmailUser, pass: gmailAppPassword } });
        const mailResult = await transporter.sendMail({
          from: `"Vivek Bhatt Portfolio" <${fromEmail}>`,
          to: ownerEmail,
          replyTo: record.email,
          subject: `New portfolio message — ${record.name}`,
          text: `New verified contact message from ${record.name} <${record.email}>\n\nReason: ${record.reason}\n\n${record.message}`,
          html: `<!doctype html><html><body style="margin:0;padding:24px;background:#050816;font-family:Arial,sans-serif;color:#e8eef7"><div style="max-width:680px;margin:auto;background:#0b1222;border:1px solid #1e293b;border-radius:18px;padding:28px"><div style="font-size:11px;letter-spacing:2px;font-weight:800;color:#f0a63c">PORTFOLIO CONTACT</div><h2 style="color:#fff;margin:10px 0 18px">New verified message</h2><p><strong>Name:</strong> ${escapeHtml(String(record.name))}</p><p><strong>Email:</strong> ${escapeHtml(String(record.email))}</p><p><strong>Reason:</strong> ${escapeHtml(String(record.reason))}</p><div style="margin-top:18px;padding:16px;background:#080f1d;border:1px solid #263449;border-radius:12px;white-space:pre-wrap;line-height:1.7;color:#c6d0df">${escapeHtml(String(record.message))}</div></div></body></html>`,
        });
        await db.query(`UPDATE public.contactmessage SET source_message_id=$1 WHERE id=$2`, [mailResult.messageId || null, id]);
      } catch (mailError) {
        // Verification remains successful even if the owner notification fails.
        console.error("CONTACT OWNER EMAIL ERROR:", mailError);
      }
    }

    return NextResponse.json({ success: true, verified: true, message: "Email verified successfully. Your message has been submitted." });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return NextResponse.json({ error: "Something went wrong while verifying the OTP.", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
