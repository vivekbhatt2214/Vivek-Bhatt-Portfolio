import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { DEFAULT_SITE_CONTENT, normalizeSiteContent } from "@/lib/site-content";
import { getProjects } from "@/lib/projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const clean = (value: unknown, max = 4000) => String(value ?? "").trim().slice(0, max);
const hasAny = (text: string, values: string[]) => values.some((value) => text.includes(value));
const list = (value: unknown) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
const tokens = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, " ").split(/\s+/).filter((x) => x.length > 2);

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isHinglish(value: string) {
  return hasAny(value.toLowerCase(), [
    "kya", "kaise", "kaun", "kitne", "kitni", "batao", "btao", "mujhe", "aap", "aapko", "iske", "uski", "hai", "hain", "mein", "me", "ko", "se", "wala", "wali", "chahiye", "chaiye", "kaha", "kahan", "kab", "kyun", "kyu", "kr", "kar", "bhi", "raha", "rhi", "hun", "ho", "hota", "hoti", "karta", "krta"
  ]);
}

function answer(message: string, context: any) {
  const q = message.toLowerCase();
  const hinglish = isHinglish(message);
  const { profile, siteContent, projects, certificates } = context;
  const name = profile.displayName || "Vivek Bhatt";
  const tools = list(profile.tools);

  if (hasAny(q, ["hello", "hi", "hey", "namaste", "hii"])) {
    return hinglish
      ? `Hi! 👋 Main ${name} ka portfolio assistant hoon. Aap About, Skills, Projects, Education, Experience, Certifications, Contact ya Interview Booking ke baare mein pooch sakte ho.`
      : `Hi! 👋 I’m ${name}'s portfolio assistant. You can ask me about About, Skills, Projects, Education, Experience, Certifications, Contact or Interview Booking.`;
  }

  if (hasAny(q, ["project", "projects", "project work", "portfolio project"])) {
    if (!projects.length) return hinglish ? "Abhi published project details available nahi hain." : "There are no published project details available right now.";
    const rows = projects.slice(0, 10).map((p: any) => `• ${p.title}${p.category ? ` — ${p.category}` : ""}${p.description ? `: ${clean(p.description, 190)}` : ""}`);
    return hinglish ? `Vivek ke portfolio mein ye projects listed hain:\n\n${rows.join("\n")}\n\nAap kisi specific project ka naam pooch sakte ho.` : `These projects are listed on Vivek's portfolio:\n\n${rows.join("\n")}\n\nAsk about a specific project for its available details.`;
  }

  if (hasAny(q, ["skill", "skills", "technology", "technologies", "tools", "stack", "tech stack"])) {
    const groups = Array.isArray(profile.skillsGroups) ? profile.skillsGroups : [];
    const groupText = groups.slice(0, 8).map((g: any) => `${g.title}: ${list(g.items).join(", ")}`).filter(Boolean).join("\n");
    return hinglish
      ? `Vivek ka main focus Data Analytics, MIS Reporting aur Business Intelligence hai. Core tools: ${tools.join(", ") || "MS Excel, SQL, Power BI aur Python"}.${groupText ? `\n\n${groupText}` : ""}`
      : `Vivek's main focus is Data Analytics, MIS Reporting and Business Intelligence. Core tools: ${tools.join(", ") || "MS Excel, SQL, Power BI and Python"}.${groupText ? `\n\n${groupText}` : ""}`;
  }

  if (hasAny(q, ["about", "who is", "who's", "vivek", "introduce", "introduction", "profile"])) {
    return hinglish
      ? `${name} ek BCA graduate hain aur unka career focus ${profile.careerGoal || "Data Analytics"} hai. ${profile.aboutIntro || ""} ${profile.aboutSecondary || ""}`.trim()
      : `${name} is a BCA graduate focused on ${profile.careerGoal || "Data Analytics"}. ${profile.aboutIntro || ""} ${profile.aboutSecondary || ""}`.trim();
  }

  if (hasAny(q, ["education", "college", "school", "degree", "qualification", "study", "studied", "bca"])) {
    const rows = list((siteContent.education?.items || []).map((x: any) => `${x.title} — ${x.institution}${x.year ? ` (${x.year})` : ""}${x.score ? ` • ${x.score}` : ""}`));
    return hinglish ? `Education details:\n\n${rows.map((x) => `• ${x}`).join("\n") || "Education details available nahi hain."}` : `Education details:\n\n${rows.map((x) => `• ${x}`).join("\n") || "Education details are not currently available."}`;
  }

  if (hasAny(q, ["experience", "internship", "work experience", "professional journey", "worked"])) {
    const rows = list((siteContent.experience?.entries || []).map((x: any) => `${x.date} — ${x.title}: ${x.text}`));
    return hinglish ? `Vivek ki professional journey:\n\n${rows.map((x) => `• ${x}`).join("\n\n") || "Experience details available nahi hain."}` : `Vivek's professional journey:\n\n${rows.map((x) => `• ${x}`).join("\n\n") || "Experience details are not currently available."}`;
  }

  if (hasAny(q, ["certificate", "certification", "certifications", "credential"])) {
    const rows = certificates.slice(0, 12).map((c: any) => `• ${c.title}${c.issuer ? ` — ${c.issuer}` : ""}${c.issueDate ? ` (${c.issueDate})` : ""}`);
    return hinglish ? `Vivek ki listed certifications:\n\n${rows.join("\n") || "Published certifications available nahi hain."}` : `Listed certifications:\n\n${rows.join("\n") || "There are no published certification details available right now."}`;
  }

  if (hasAny(q, ["contact", "email", "linkedin", "github", "reach", "connect"])) {
    return hinglish
      ? `Vivek se contact karne ke liye email ${siteContent.contact?.email || "Contact section mein available email"} hai. LinkedIn aur GitHub links bhi Contact/Footer section mein available hain.`
      : `You can contact Vivek at ${siteContent.contact?.email || "the email shown in the Contact section"}. LinkedIn and GitHub links are also available in the Contact/Footer sections.`;
  }

  if (hasAny(q, ["interview", "book", "booking", "slot", "schedule", "meeting"])) {
    return hinglish
      ? "Interview book karne ke liye Book an Interview section use karein aur available date/time slot select karein. Main live availability guess nahi karta; booking form actual available slots dikhata hai."
      : "To book an interview, use the Book an Interview section and select an available date and time slot. I do not guess live availability; the booking form shows the actual available slots.";
  }

  if (hasAny(q, ["resume", "cv", "curriculum vitae"])) {
    return hinglish ? "Resume portfolio ke Resume section mein available hai. Agar published resume hai to wahi se view/download kar sakte ho." : "The resume is available in the Resume section. If a published resume is available, you can view or download it there.";
  }

  if (hasAny(q, ["location", "where", "from", "city", "uttarakhand", "bageshwar"])) {
    return hinglish ? `Portfolio ke according location ${siteContent.contact?.location || "available nahi hai"} hai.` : `According to the portfolio, the location is ${siteContent.contact?.location || "not currently available"}.`;
  }

  if (hasAny(q, ["career", "goal", "looking for", "job", "role", "opportunity", "hiring"])) {
    return hinglish ? `Vivek ka current career focus ${profile.careerGoal || "Data Analytics"} hai, with an interest in ${profile.careerSubline || "Business Intelligence"}.` : `Vivek's current career focus is ${profile.careerGoal || "Data Analytics"}, with an interest in ${profile.careerSubline || "Business Intelligence"}.`;
  }

  const corpus = [
    { title: "About", text: `${profile.aboutIntro || ""} ${profile.aboutSecondary || ""}` },
    { title: "Skills", text: `${tools.join(" ")} ${list(profile.strengths).join(" ")}` },
    ...projects.map((p: any) => ({ title: p.title, text: `${p.description || ""} ${p.overview || ""} ${p.category || ""} ${p.technologies || ""}` })),
    ...certificates.map((c: any) => ({ title: c.title, text: `${c.issuer || ""} ${c.description || ""}` })),
  ];
  const queryTokens = tokens(message);
  const ranked = corpus.map((item) => ({ item, score: queryTokens.reduce((score, token) => score + (item.text.toLowerCase().includes(token) ? 1 : 0), 0) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  if (ranked.length) {
    const rows = ranked.map(({ item }) => `• ${item.title}: ${clean(item.text, 260)}`).join("\n");
    return hinglish ? `Mujhe portfolio mein ye related information mili:\n\n${rows}\n\nAap specific section ya project ka naam bata do, main available details explain kar dunga.` : `I found these related details in the portfolio:\n\n${rows}\n\nName a specific section or project and I can explain the available details.`;
  }

  return hinglish
    ? "Is question ka exact answer portfolio data mein nahi mila. Aap About, Skills, Projects, Education, Experience, Certifications, Contact ya Interview Booking ke baare mein pooch sakte ho."
    : "I couldn't find that information in the portfolio data. You can ask me about About, Skills, Projects, Education, Experience, Certifications, Contact or Interview Booking.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = clean(body?.message, 2500);
    if (!message) return errorResponse("Please enter a message.");

    await ensurePortfolioSchema();

    let profile: any = {};
    let siteContent: any = DEFAULT_SITE_CONTENT;
    let projects: any[] = [];
    let certificates: any[] = [];

    try {
      const [settingsResult, projectResult, certificateResult] = await Promise.all([
        db.query(`SELECT setting_key, setting_value FROM public.portfolio_site_settings WHERE setting_key IN ('profile','site_content')`),
        getProjects(),
        db.query(`SELECT id,title,issuer,issue_date AS "issueDate",description FROM public.portfolio_certificates WHERE published = TRUE ORDER BY sort_order ASC, created_at DESC LIMIT 20`),
      ]);
      const settings = new Map(settingsResult.rows.map((row: any) => [row.setting_key, row.setting_value]));
      profile = settings.get("profile") || {};
      siteContent = normalizeSiteContent(settings.get("site_content") || DEFAULT_SITE_CONTENT);
      projects = Array.isArray(projectResult) ? projectResult : [];
      certificates = certificateResult.rows || [];
    } catch (contextError) {
      console.error("Portfolio assistant context load warning:", contextError);
    }

    return NextResponse.json({
      answer: answer(message, { profile, siteContent, projects, certificates }),
      mode: "portfolio-assistant",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Portfolio assistant error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unable to answer right now.", 500);
  }
}
