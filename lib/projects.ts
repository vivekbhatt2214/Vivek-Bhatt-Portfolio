import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

const STATIC_PROJECT_IMAGES: Record<string, string> = {
  "swiggy-sales-dashboard": "/projects/swiggy.png",
  "hr-analytics-dashboard": "/projects/hr.png",
  "blinkit-sales-dashboard": "/projects/blinkit.png",
  "starbucks-analytics-dashboard": "/projects/starbucks-dashboard.png",
  "phonepe-transaction-analytics-dashboard": "/projects/phonepe.png",
};

const projectSelect = `
  SELECT
    id,
    slug,
    title,
    short_title AS "shortTitle",
    description,
    overview,
    work_done AS "workDone",
    methodology,
    insights,
    outcome,
    category,
    technologies,
    image_url AS "imageUrl",
    image_file_id AS "imageFileId",
    gallery,
    github_url AS "githubUrl",
    live_url AS "liveUrl",
    project_file_url AS "projectFileUrl",
    project_file_name AS "projectFileName",
    project_file_type AS "projectFileType",
    project_file_id AS "projectFileId",
    featured,
    published,
    sort_order AS "sortOrder"
  FROM portfolio_projects
`;

export async function getProjects() {
  await ensurePortfolioSchema();
  const result = await db.query(
    `${projectSelect}
     WHERE published = TRUE
     ORDER BY featured DESC, sort_order ASC, id DESC`
  );
  return result.rows.map(normalizeProject);
}

export async function getProjectBySlug(slug: string) {
  await ensurePortfolioSchema();
  const result = await db.query(
    `${projectSelect}
     WHERE slug = $1 AND published = TRUE
     LIMIT 1`,
    [slug]
  );
  return result.rows[0] ? normalizeProject(result.rows[0]) : null;
}

function normalizeProject(row: any) {
  const rawImageFileId = row.imageFileId == null ? "" : String(row.imageFileId).trim();
  const imageFileId =
    rawImageFileId && rawImageFileId !== "NaN" && rawImageFileId !== "undefined"
      ? rawImageFileId
      : null;
  const fileImage = imageFileId ? `/api/files/${encodeURIComponent(imageFileId)}` : "";
  const databaseImage = String(row.imageUrl ?? "").trim();
  const fallbackImage = STATIC_PROJECT_IMAGES[String(row.slug)] ?? "";

  // A newly uploaded PostgreSQL image always wins over an old image_url.
  // If there is no uploaded file, use the saved URL, then the bundled
  // dashboard image. This keeps old records visible too.
  const image = fileImage || databaseImage || fallbackImage || null;

  return {
    ...row,
    id: row.id == null ? null : String(row.id),
    image,
    imageUrl: databaseImage || null,
    imageFileId,
    projectFileId:
      row.projectFileId == null ? null : String(row.projectFileId),
    technologies: Array.isArray(row.technologies)
      ? JSON.stringify(row.technologies)
      : String(row.technologies ?? "[]"),
    gallery: Array.isArray(row.gallery) ? row.gallery : parseArray(row.gallery),
    featured: Boolean(row.featured),
    published: Boolean(row.published),
  };
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
