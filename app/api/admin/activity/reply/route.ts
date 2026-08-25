import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown) => String(value ?? "").trim();

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return jsonError("Unauthorized", 401);

  try {
    await ensurePortfolioSchema();

    const body = await request.json();
    const type = clean(body.type);
    const id = clean(body.id);
    const message = clean(body.message);

    if (!id) return jsonError("Record ID is required.");
    if (!message) return jsonError("Reply message is required.");
    if (message.length > 10000) return jsonError("Reply is too long. Please keep it under 10,000 characters.");
    if (type !== "message" && type !== "interview") return jsonError("Replies are available for contact messages and interview requests only.");

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || gmailUser;

    if (!gmailUser || !gmailAppPassword || !fromEmail) {
      return jsonError("Email service is not configured. Please check the existing Gmail environment variables.", 500);
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    let recipientEmail = "";
    let recipientName = "";
    let subject = "";
    let context = "";
    let sourceMessageId = "";

    if (type === "message") {
      const result = await db.query(
        `SELECT id,name,email,reason,message,"createdAt",source_message_id FROM public.contactmessage WHERE id=$1 LIMIT 1`,
        [id]
      );
      if (!result.rowCount) return jsonError("Contact message not found.", 404);
      const record = result.rows[0];
      recipientEmail = clean(record.email).toLowerCase();
      recipientName = clean(record.name) || "there";
      subject = `Re: ${clean(record.reason) || "Your portfolio message"} — Vivek Bhatt`;
      context = `Your original message: ${clean(record.message)}`;
      sourceMessageId = clean(record.source_message_id);
    } else {
      const result = await db.query(
        `SELECT id,name,email,"interviewType",date,"startTime","endTime",message,status,source_message_id FROM public.interviewbooking WHERE id=$1 LIMIT 1`,
        [id]
      );
      if (!result.rowCount) return jsonError("Interview request not found.", 404);
      const record = result.rows[0];
      recipientEmail = clean(record.email).toLowerCase();
      recipientName = clean(record.name) || "there";
      const dateLabel = record.date
        ? new Date(record.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })
        : "scheduled interview";
      subject = `Re: Interview booking — ${dateLabel} ${clean(record.startTime)}–${clean(record.endTime)}`;
      context = `Interview request: ${clean(record.interviewType) || "Job Interview"} on ${dateLabel}, ${clean(record.startTime)}–${clean(record.endTime)}${clean(record.message) ? `\nApplicant message: ${clean(record.message)}` : ""}`;
    }

    if (!isValidEmail(recipientEmail)) return jsonError("The recipient email address is invalid.", 400);

    const previousReplies = await db.query(`SELECT message_id FROM public.admin_activity_replies WHERE record_type=$1 AND record_id=$2 AND message_id IS NOT NULL ORDER BY sent_at ASC`, [type, id]);
    const replyIds = previousReplies.rows.map((row: any) => clean(row.message_id)).filter(Boolean);
    const inReplyTo = replyIds.at(-1) || sourceMessageId || "";
    const references = [sourceMessageId, ...replyIds].filter(Boolean).join(" ");

    const safeName = escapeHtml(recipientName);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const safeContext = escapeHtml(context).replace(/\n/g, "<br />");

    const mailResult = await transporter.sendMail({
      from: `"Vivek Bhatt Portfolio" <${fromEmail}>`,
      to: recipientEmail,
      replyTo: fromEmail,
      subject,
      headers: {
        ...(inReplyTo ? { "In-Reply-To": inReplyTo } : {}),
        ...(references ? { References: references } : {}),
        "X-Portfolio-Record": `${type}:${id}`,
      },
      text: `Hello ${recipientName},\n\n${message}\n\n--- Original request ---\n${context}\n\nRegards,\nVivek Bhatt`,
      html: `<!doctype html><html><body style="margin:0;padding:0;background:#050816;font-family:Arial,Helvetica,sans-serif;color:#e8eef7"><div style="max-width:680px;margin:30px auto;padding:20px"><div style="background:#0b1222;border:1px solid #1e293b;border-radius:20px;padding:30px"><div style="font-size:11px;font-weight:800;letter-spacing:2px;color:#f0a63c;margin-bottom:12px">VIVEK BHATT PORTFOLIO</div><h2 style="margin:0 0 16px;color:#fff">Hello ${safeName},</h2><div style="font-size:15px;line-height:1.75;color:#b8c4d4">${safeMessage}</div><div style="margin-top:24px;padding:16px;border:1px solid #263449;border-radius:12px;background:#080f1d;color:#7f8da2;font-size:12px;line-height:1.6"><strong style="color:#dbe5f1">Reference</strong><br />${safeContext}</div><div style="margin-top:24px;padding-top:18px;border-top:1px solid #1e293b;color:#718096;font-size:12px">Regards,<br /><strong style="color:#fff">Vivek Bhatt</strong></div></div></div></body></html>`,
    });

    await db.query(
      `INSERT INTO public.admin_activity_replies(record_type,record_id,recipient_email,subject,message,message_id) VALUES($1,$2,$3,$4,$5,$6)`,
      [type, id, recipientEmail, subject, message, mailResult.messageId || null]
    );

    return NextResponse.json({
      success: true,
      message: `Reply sent successfully to ${recipientEmail}.`,
      recipientEmail,
      messageId: mailResult.messageId || null,
    });
  } catch (error) {
    console.error("Admin activity reply error:", error);
    return jsonError(error instanceof Error ? error.message : "Unable to send reply.", 500);
  }
}
