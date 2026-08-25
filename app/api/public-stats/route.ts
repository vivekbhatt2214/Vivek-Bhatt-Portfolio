import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensurePortfolioSchema();
    const result = await db.query(`
      SELECT COUNT(DISTINCT session_id)::int AS visitors,
             COUNT(DISTINCT session_id) FILTER (WHERE created_at >= CURRENT_DATE)::int AS today,
             COUNT(DISTINCT session_id) FILTER (WHERE created_at >= NOW()-INTERVAL '5 minutes')::int AS online
      FROM analytics_events
    `);
    const row = result.rows[0] ?? {};
    return NextResponse.json({visitors:Number(row.visitors||0),today:Number(row.today||0),online:Number(row.online||0)},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error(error);
    return NextResponse.json({visitors:0,today:0,online:0},{headers:{"Cache-Control":"no-store"}});
  }
}
