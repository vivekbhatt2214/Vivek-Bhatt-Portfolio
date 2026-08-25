import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";
import { isValidInterviewSlot } from "@/lib/interview-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown) => String(value ?? "").trim();

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  if (!(await isAdmin())) return jsonError("Unauthorized", 401);

  try {
    await ensurePortfolioSchema();

    const [downloads, calls, messages, interviews, replies] = await Promise.all([
      db.query(`SELECT id,project_title,email,verified_at,downloaded_at,created_at FROM public.project_download_requests ORDER BY created_at DESC`),
      db.query(`SELECT id,name,email,phone,preferred_time,reason,message,status,created_at FROM public.call_requests ORDER BY created_at DESC`),
      db.query(`SELECT id,name,email,reason,message,verified,"lastSentAt","createdAt" FROM public.contactmessage ORDER BY "createdAt" DESC`),
      db.query(`SELECT id,name,email,company,"interviewType","meetingLink",message,date,"startTime","endTime",status,"slotId","createdAt","updatedAt" FROM public.interviewbooking ORDER BY date DESC, "startTime" DESC, "createdAt" DESC`),
      db.query(`SELECT id,record_type,record_id,recipient_email,subject,message,message_id,sent_at FROM public.admin_activity_replies ORDER BY sent_at DESC`),
    ]);
    const replyMap=new Map<string,any[]>(); for(const r of replies.rows){const k=`${r.record_type}:${String(r.record_id)}`;const list=replyMap.get(k)||[];list.push(r);replyMap.set(k,list);}
    const withMeta=(rows:any[],type:string)=>rows.map(row=>{const email=clean(row.email).toLowerCase();const hash=email?createHash("md5").update(email).digest("hex"):"";return {...row,replyHistory:replyMap.get(`${type}:${String(row.id)}`)||[],avatar_urls:email?[`https://www.google.com/s2/photos/profile/${encodeURIComponent(email)}`,`https://unavatar.io/email/${encodeURIComponent(email)}?fallback=false`]:[],avatar_url:email?`https://www.google.com/s2/photos/profile/${encodeURIComponent(email)}`:null,avatar_fallback_url:hash?`https://www.gravatar.com/avatar/${hash}?s=96&d=404&r=g`:null};});
    return NextResponse.json({downloads:withMeta(downloads.rows,"download"),calls:withMeta(calls.rows,"call"),messages:withMeta(messages.rows,"message"),interviews:withMeta(interviews.rows,"interview")},{headers:{"Cache-Control":"no-store"}});
  } catch (error) {
    console.error("Admin activity GET error:", error);
    return jsonError(error instanceof Error ? error.message : "Unable to load activity.", 500);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return jsonError("Unauthorized", 401);

  try {
    await ensurePortfolioSchema();
    const body = await request.json();
    const type = clean(body.type);
    const id = clean(body.id);
    const data = body.data && typeof body.data === "object" ? body.data : {};

    if (!id) return jsonError("Record ID is required.");

    if (type === "message") {
      const result = await db.query(`
        UPDATE public.contactmessage
        SET name=$1,email=$2,reason=$3,message=$4,verified=$5
        WHERE id=$6
        RETURNING id
      `, [clean(data.name), clean(data.email).toLowerCase(), clean(data.reason), clean(data.message), Boolean(data.verified), id]);
      if (!result.rowCount) return jsonError("Contact message not found.", 404);
    } else if (type === "call") {
      const result = await db.query(`
        UPDATE public.call_requests
        SET name=$1,email=$2,phone=$3,preferred_time=$4,reason=$5,message=$6,status=$7
        WHERE id=$8
        RETURNING id
      `, [clean(data.name), clean(data.email).toLowerCase(), clean(data.phone) || null, clean(data.preferredTime) || null, clean(data.reason) || null, clean(data.message) || null, clean(data.status) || "PENDING", id]);
      if (!result.rowCount) return jsonError("Call request not found.", 404);
    } else if (type === "download") {
      const result = await db.query(`
        UPDATE public.project_download_requests
        SET project_title=$1,email=$2,verified_at=$3,downloaded_at=$4
        WHERE id=$5
        RETURNING id
      `, [clean(data.projectTitle), clean(data.email).toLowerCase(), data.verifiedAt || null, data.downloadedAt || null, id]);
      if (!result.rowCount) return jsonError("Download record not found.", 404);
    } else if (type === "interview") {
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const old = await client.query(`SELECT id,"slotId",date,"startTime","endTime" FROM public.interviewbooking WHERE id=$1 FOR UPDATE`, [id]);
        if (!old.rowCount) { await client.query("ROLLBACK"); return jsonError("Interview request not found.", 404); }

        const current = old.rows[0];
        const dateValue = clean(data.date);
        const startTime = clean(data.startTime);
        const endTime = clean(data.endTime);
        if (!dateValue || !startTime || !endTime) { await client.query("ROLLBACK"); return jsonError("Interview date and time are required."); }
        if (!isValidInterviewSlot(startTime, endTime)) { await client.query("ROLLBACK"); return jsonError("Interview slots are available every 30 minutes from 9:00 AM to 9:00 PM."); }

        const slotChanged = dateValue !== new Date(current.date).toISOString().slice(0,10) || startTime !== clean(current.startTime) || endTime !== clean(current.endTime);
        let slotId = current.slotId;

        if (slotChanged) {
          const found = await client.query(`SELECT id,"isAvailable" FROM public.interviewslot WHERE DATE(date)= $1::date AND "startTime"=$2 AND "endTime"=$3 LIMIT 1 FOR UPDATE`, [dateValue, startTime, endTime]);
          let slot = found.rows[0];
          if (!slot) {
            const created = await client.query(`INSERT INTO public.interviewslot(date,"startTime","endTime","isAvailable") VALUES ($1::date,$2,$3,TRUE) RETURNING id,"isAvailable"`, [dateValue,startTime,endTime]);
            slot = created.rows[0];
          }
          if (!slot.isAvailable && String(slot.id) !== String(current.slotId)) { await client.query("ROLLBACK"); return jsonError("The new interview slot is already booked."); }
          await client.query(`UPDATE public.interviewslot SET "isAvailable"=FALSE WHERE id=$1`, [slot.id]);
          slotId = slot.id;
          if (current.slotId && String(current.slotId) !== String(slotId)) {
            await client.query(`UPDATE public.interviewslot SET "isAvailable"=TRUE WHERE id=$1`, [current.slotId]);
          }
        }

        await client.query(`
          UPDATE public.interviewbooking
          SET name=$1,email=$2,company=$3,"interviewType"=$4,"meetingLink"=$5,message=$6,date=$7::date,"startTime"=$8,"endTime"=$9,status=$10,"slotId"=$11,"updatedAt"=NOW()
          WHERE id=$12
        `, [clean(data.name), clean(data.email).toLowerCase(), clean(data.company)||null, clean(data.interviewType)||"Job Interview", clean(data.meetingLink)||null, clean(data.message)||null, dateValue,startTime,endTime,clean(data.status)||"PENDING",slotId,id]);

        await client.query("COMMIT");
      } catch (error) {
        try { await client.query("ROLLBACK"); } catch {}
        throw error;
      } finally {
        client.release();
      }
    } else {
      return jsonError("Unsupported record type.");
    }

    return NextResponse.json({ success: true, message: "Record updated successfully." });
  } catch (error) {
    console.error("Admin activity POST error:", error);
    return jsonError(error instanceof Error ? error.message : "Unable to update record.", 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return jsonError("Unauthorized", 401);

  try {
    await ensurePortfolioSchema();
    const body = await request.json();
    const type = clean(body.type);
    const id = clean(body.id);
    if (!id) return jsonError("Record ID is required.");

    if (type === "message") {
      const result=await db.query(`DELETE FROM public.contactmessage WHERE id=$1`, [id]); if(!result.rowCount)return jsonError("Contact message not found.",404);
      await db.query(`DELETE FROM public.admin_activity_replies WHERE record_type='message' AND record_id=$1`,[id]);
    } else if (type === "call") {
      const result=await db.query(`DELETE FROM public.call_requests WHERE id=$1`, [id]); if(!result.rowCount)return jsonError("Call request not found.",404);
    } else if (type === "download") {
      const result=await db.query(`DELETE FROM public.project_download_requests WHERE id=$1`, [id]); if(!result.rowCount)return jsonError("Download record not found.",404);
    } else if (type === "interview") {
      const client = await db.connect();
      try {
        await client.query("BEGIN");
        const old = await client.query(`SELECT "slotId" FROM public.interviewbooking WHERE id=$1 FOR UPDATE`, [id]);
        if (old.rowCount && old.rows[0].slotId) await client.query(`UPDATE public.interviewslot SET "isAvailable"=TRUE WHERE id=$1`, [old.rows[0].slotId]);
        const deleted=await client.query(`DELETE FROM public.interviewbooking WHERE id=$1`, [id]); if(!deleted.rowCount){await client.query("ROLLBACK");return jsonError("Interview request not found.",404);}
        await client.query(`DELETE FROM public.admin_activity_replies WHERE record_type='interview' AND record_id=$1`,[id]);
        await client.query("COMMIT");
      } catch (error) { try { await client.query("ROLLBACK"); } catch {} throw error; } finally { client.release(); }
    } else {
      return jsonError("Unsupported record type.");
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    console.error("Admin activity DELETE error:", error);
    return jsonError(error instanceof Error ? error.message : "Unable to delete record.", 500);
  }
}
