import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { DEFAULT_SITE_CONTENT, normalizeSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fallbackProfile = {
  displayName: "Vivek Bhatt",
  headline: "Data Analytics • MIS • Business Intelligence",
  avatarFileId: null,
  aboutIntro: "I am a BCA graduate and aspiring Data Analyst with a growing interest in turning raw information into clear, meaningful insights.",
  aboutSecondary: "I am building my practical knowledge through hands-on projects using MS Excel, SQL, Power BI and Python. My focus is on understanding data, finding patterns, creating useful dashboards and presenting information in a simple and understandable way.",
  aboutHighlights: ["BCA graduate with a strong interest in Data Analytics", "Hands-on experience through self-driven projects", "Building dashboards and analytical reports", "Focused on developing job-ready analytical skills"],
  careerGoal: "Data Analyst",
  careerSubline: "Business Intelligence",
  cgpa: "8.0",
  projectStat: "4+",
  analyticsStat: "6+",
  strengths: ["Analytical thinking", "Problem solving", "Attention to detail", "Data visualization"],
  values: ["Continuous learning", "Accuracy & consistency", "Practical approach", "Professional growth"],
  interests: ["Data Analytics", "Business Intelligence", "Dashboard Design", "Data Visualization"],
  tools: ["MS Excel", "SQL", "Power BI", "Python"],
  skillsGroups: [],
};

export async function GET() {
  try {
    await ensurePortfolioSchema();
    const result = await db.query(`SELECT setting_key, setting_value FROM public.portfolio_site_settings WHERE setting_key IN ('profile','site_content')`);
    const settings = new Map(result.rows.map((row: any) => [row.setting_key, row.setting_value]));
    return NextResponse.json({
      profile: { ...fallbackProfile, ...(settings.get("profile") || {}) },
      siteContent: normalizeSiteContent(settings.get("site_content") || DEFAULT_SITE_CONTENT),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ profile: fallbackProfile, siteContent: DEFAULT_SITE_CONTENT }, { headers: { "Cache-Control": "no-store" } });
  }
}
