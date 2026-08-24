import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  try {
    await ensurePortfolioSchema();
    const [stats,daily,activity] = await Promise.all([
      db.query(`
        SELECT
          COUNT(DISTINCT session_id)::int AS total_visitors,
          COUNT(*) FILTER (WHERE event_type='page_view')::int AS page_views,
          COUNT(DISTINCT session_id) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes')::int AS active_now,
          COUNT(*)::int AS total_events,
          COUNT(*) FILTER (WHERE event_type='resume_view')::int AS resume_views,
          COUNT(*) FILTER (WHERE event_type='resume_download')::int AS resume_downloads,
          COUNT(*) FILTER (WHERE event_type IN ('project_view','projects_view'))::int AS project_clicks,
          COUNT(*) FILTER (WHERE event_type IN ('project_github_click','github_click'))::int AS github_clicks,
          COUNT(*) FILTER (WHERE event_type IN ('project_live_click','live_project_click'))::int AS live_project_clicks,
          COUNT(*) FILTER (WHERE event_type IN ('interview_click','interview_request','interview_requests'))::int AS interview_clicks,
          COUNT(*) FILTER (WHERE event_type IN ('contact','contact_submit','contact_submission'))::int AS contacts,
          COUNT(*) FILTER (WHERE event_type='verified_contact')::int AS verified_contacts
        FROM analytics_events
      `),
      db.query(`
        SELECT
          TO_CHAR(day, 'Mon DD') AS label,
          COUNT(*)::int AS events,
          COUNT(DISTINCT e.session_id)::int AS visitors,
          COUNT(*) FILTER (WHERE e.event_type = 'page_view')::int AS page_views,
          COUNT(*) FILTER (
            WHERE e.event_type IN ('project_view', 'projects_view')
          )::int AS projects,
          COUNT(*) FILTER (WHERE e.event_type = 'resume_view')::int AS resume,
          COUNT(*) FILTER (
            WHERE e.event_type IN ('project_github_click', 'github_click')
          )::int AS github,
          COUNT(*) FILTER (
            WHERE e.event_type IN ('contact', 'contact_submit', 'contact_submission')
          )::int AS contacts
        FROM generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) AS day
        LEFT JOIN analytics_events e
          ON e.created_at::date = day::date
        GROUP BY day
        ORDER BY day
      `),
      db.query(`
        SELECT id,event_type,session_id,page_path,metadata,created_at
        FROM analytics_events ORDER BY created_at DESC LIMIT 30
      `)
    ]);

    return NextResponse.json({
      success:true,
      data:{
        totalVisitors:Number(stats.rows[0]?.total_visitors ?? 0), pageViews:Number(stats.rows[0]?.page_views ?? 0),
        activeNow:Number(stats.rows[0]?.active_now ?? 0), totalEvents:Number(stats.rows[0]?.total_events ?? 0),
        resumeViews:Number(stats.rows[0]?.resume_views ?? 0), resumeDownloads:Number(stats.rows[0]?.resume_downloads ?? 0),
        projectClicks:Number(stats.rows[0]?.project_clicks ?? 0), githubClicks:Number(stats.rows[0]?.github_clicks ?? 0),
        liveProjectClicks:Number(stats.rows[0]?.live_project_clicks ?? 0), interviewClicks:Number(stats.rows[0]?.interview_clicks ?? 0),
        contacts:Number(stats.rows[0]?.contacts ?? 0), verifiedContacts:Number(stats.rows[0]?.verified_contacts ?? 0),
        daily:daily.rows, activity:activity.rows,
      }
    },{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    console.error("Admin analytics error",error);
    return NextResponse.json({success:false,message:"Unable to load analytics"},{status:500});
  }
}
