import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";
import { DEFAULT_SITE_CONTENT, normalizeSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PROFILE = {
  displayName: "Vivek Bhatt",
  headline: "Data Analytics • MIS • Business Intelligence",
  avatarFileId: null as string | null,
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
  skillsGroups: [] as any[],
};

const err = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

function normalizeProfile(input: any) {
  const x = input && typeof input === "object" ? input : {};
  const list = (value: unknown, fallback: string[]) => Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean).slice(0, 20) : fallback;
  return {
    ...DEFAULT_PROFILE,
    ...x,
    displayName: String(x.displayName ?? DEFAULT_PROFILE.displayName).trim().slice(0, 100),
    headline: String(x.headline ?? DEFAULT_PROFILE.headline).trim().slice(0, 180),
    avatarFileId: x.avatarFileId ? String(x.avatarFileId) : null,
    aboutIntro: String(x.aboutIntro ?? DEFAULT_PROFILE.aboutIntro).trim().slice(0, 1500),
    aboutSecondary: String(x.aboutSecondary ?? DEFAULT_PROFILE.aboutSecondary).trim().slice(0, 2500),
    aboutHighlights: list(x.aboutHighlights, DEFAULT_PROFILE.aboutHighlights),
    careerGoal: String(x.careerGoal ?? DEFAULT_PROFILE.careerGoal).trim().slice(0, 120),
    careerSubline: String(x.careerSubline ?? DEFAULT_PROFILE.careerSubline).trim().slice(0, 120),
    cgpa: String(x.cgpa ?? DEFAULT_PROFILE.cgpa).trim().slice(0, 30),
    projectStat: String(x.projectStat ?? DEFAULT_PROFILE.projectStat).trim().slice(0, 30),
    analyticsStat: String(x.analyticsStat ?? DEFAULT_PROFILE.analyticsStat).trim().slice(0, 30),
    strengths: list(x.strengths, DEFAULT_PROFILE.strengths),
    values: list(x.values, DEFAULT_PROFILE.values),
    interests: list(x.interests, DEFAULT_PROFILE.interests),
    tools: list(x.tools, DEFAULT_PROFILE.tools),
    skillsGroups: Array.isArray(x.skillsGroups)
      ? x.skillsGroups.slice(0, 12).map((g: any) => ({
          title: String(g?.title ?? "").trim().slice(0, 100),
          description: String(g?.description ?? "").trim().slice(0, 400),
          items: Array.isArray(g?.items) ? g.items.map(String).map((v: string) => v.trim()).filter(Boolean).slice(0, 25) : [],
        })).filter((g: any) => g.title)
      : DEFAULT_PROFILE.skillsGroups,
  };
}

export async function GET() {
  if (!(await isAdmin())) return err("Unauthorized", 401);
  try {
    await ensurePortfolioSchema();
    const result = await db.query(`SELECT setting_key, setting_value FROM public.portfolio_site_settings WHERE setting_key IN ('profile','site_content')`);
    const settings = new Map(result.rows.map((row: any) => [row.setting_key, row.setting_value]));
    return NextResponse.json({
      profile: { ...DEFAULT_PROFILE, ...(settings.get("profile") || {}) },
      siteContent: normalizeSiteContent(settings.get("site_content") || DEFAULT_SITE_CONTENT),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin site GET error:", error);
    return err(error instanceof Error ? error.message : "Unable to load site settings.", 500);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return err("Unauthorized", 401);
  try {
    await ensurePortfolioSchema();
    const body = await request.json();
    const profile = normalizeProfile(body?.profile);
    const siteContent = normalizeSiteContent(body?.siteContent);

    await db.query(`
      INSERT INTO public.portfolio_site_settings(setting_key,setting_value,updated_at)
      VALUES('profile',$1::jsonb,NOW())
      ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()
    `, [JSON.stringify(profile)]);

    await db.query(`
      INSERT INTO public.portfolio_site_settings(setting_key,setting_value,updated_at)
      VALUES('site_content',$1::jsonb,NOW())
      ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()
    `, [JSON.stringify(siteContent)]);

    return NextResponse.json({ success: true, profile, siteContent, message: "Profile and portfolio sections saved successfully." });
  } catch (error) {
    console.error("Admin site POST error:", error);
    return err(error instanceof Error ? error.message : "Unable to save site settings.", 500);
  }
}
