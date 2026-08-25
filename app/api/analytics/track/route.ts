import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await ensurePortfolioSchema();
    const body = await request.json();
    const sessionId = String(body.sessionId || "").trim();
    const eventType = String(body.eventType || body.type || "page_view").trim().slice(0, 80);
    const pagePath = String(body.page || body.path || "/").trim().slice(0, 500) || "/";
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    if (!sessionId) return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });

    await db.query(`
      INSERT INTO analytics_events (id,event_type,session_id,page_path,metadata)
      VALUES ($1,$2,$3,$4,$5::jsonb)
    `,[crypto.randomUUID(),eventType,sessionId,pagePath,JSON.stringify(metadata)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
