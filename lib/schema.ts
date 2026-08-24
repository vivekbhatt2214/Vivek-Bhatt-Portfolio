import { db } from "@/lib/db";

let ready: Promise<void> | null = null;

/**
 * Creates/migrates the portfolio database safely.
 *
 * Important:
 * - File reference columns intentionally do NOT use PostgreSQL foreign keys.
 * - Older versions of this project used different integer types for file IDs.
 * - Removing those FK dependencies makes the schema migration idempotent and
 *   prevents "foreign key constraint cannot be implemented" errors.
 */
export function ensurePortfolioSchema() {
  if (!ready) {
    ready = createSchema().catch((error) => {
      // Never cache a failed migration forever.
      // A later request can retry it.
      ready = null;
      throw error;
    });
  }

  return ready;
}

async function createSchema() {
  /*
   * Explicitly select the public schema.
   *
   * This fixes:
   * "no schema has been selected to create in"
   *
   * We also use public. explicitly below so the application does not depend
   * on the connection's default search_path.
   */
  await db.query(`SET search_path TO public`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.analytics_events (
      id UUID PRIMARY KEY,
      event_type TEXT NOT NULL,
      session_id TEXT NOT NULL,
      page_path TEXT NOT NULL DEFAULT '/',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS analytics_events_created_idx
      ON public.analytics_events(created_at DESC);

    CREATE INDEX IF NOT EXISTS analytics_events_session_idx
      ON public.analytics_events(session_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS public.portfolio_files (
      id BIGSERIAL PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes BIGINT NOT NULL,
      data BYTEA NOT NULL,
      protected BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.portfolio_projects (
      id BIGSERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      short_title TEXT,
      description TEXT NOT NULL DEFAULT '',
      overview TEXT,
      work_done TEXT,
      methodology TEXT,
      insights TEXT,
      outcome TEXT,
      category TEXT NOT NULL DEFAULT 'Data Analytics',
      technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
      image_url TEXT,
      gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
      github_url TEXT,
      live_url TEXT,
      project_file_url TEXT,
      project_file_name TEXT,
      project_file_type TEXT,
      project_file_id BIGINT,
      image_file_id BIGINT,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.portfolio_certificates (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT,
      issue_date TEXT,
      credential_id TEXT,
      credential_url TEXT,
      image_url TEXT,
      file_url TEXT,
      image_file_id BIGINT,
      file_id BIGINT,
      description TEXT,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.portfolio_resumes (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      version TEXT,
      description TEXT,
      file_url TEXT NOT NULL,
      file_name TEXT,
      file_id BIGINT,
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.project_download_requests (
      id BIGSERIAL PRIMARY KEY,
      project_id BIGINT,
      project_slug TEXT NOT NULL,
      project_title TEXT NOT NULL,
      email TEXT NOT NULL,
      otp_hash TEXT,
      otp_expires_at TIMESTAMPTZ,
      verified_at TIMESTAMPTZ,
      downloaded_at TIMESTAMPTZ,
      file_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS project_download_email_idx
      ON public.project_download_requests(email);

    CREATE TABLE IF NOT EXISTS public.call_requests (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      preferred_time TEXT,
      reason TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  /*
   * Remove every old FK that points at portfolio_files.
   * This handles older databases even when the constraint name differs.
   */
  await db.query(`
    DO $$
    DECLARE
      fk RECORD;
    BEGIN
      IF to_regclass('public.portfolio_files') IS NOT NULL THEN
        FOR fk IN
          SELECT
            conrelid::regclass AS table_name,
            conname
          FROM pg_constraint
          WHERE contype = 'f'
            AND confrelid = 'public.portfolio_files'::regclass
        LOOP
          EXECUTE format(
            'ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I',
            fk.table_name,
            fk.conname
          );
        END LOOP;
      END IF;
    END $$;
  `);

  /*
   * Normalize existing file IDs.
   * Numeric old values are preserved.
   * Anything non-numeric is converted to NULL rather than crashing migration.
   */
  await db.query(`
    ALTER TABLE public.project_download_requests
      ALTER COLUMN project_id TYPE TEXT
      USING project_id::text;

    ALTER TABLE public.portfolio_files
      ADD COLUMN IF NOT EXISTS protected BOOLEAN NOT NULL DEFAULT FALSE;

    ALTER TABLE public.portfolio_projects
      ADD COLUMN IF NOT EXISTS project_file_id BIGINT;

    ALTER TABLE public.portfolio_projects
      ADD COLUMN IF NOT EXISTS image_file_id BIGINT;

    ALTER TABLE public.portfolio_certificates
      ADD COLUMN IF NOT EXISTS image_file_id BIGINT;

    ALTER TABLE public.portfolio_certificates
      ADD COLUMN IF NOT EXISTS file_id BIGINT;

    ALTER TABLE public.portfolio_resumes
      ADD COLUMN IF NOT EXISTS file_id BIGINT;
  `);

  /*
   * The current application uses numeric file IDs.
   *
   * Some older versions of the portfolio created portfolio_files.id
   * as UUID/text. In that case a normal ALTER ... TYPE BIGINT cannot work,
   * and uploads later return NaN.
   *
   * Migrate the file table itself to a clean BIGINT key while keeping
   * the stored binary data intact.
   */
  await ensurePortfolioFileIdIsBigInt();

  await normalizeNumericColumn(
    "portfolio_projects",
    "project_file_id"
  );

  await normalizeNumericColumn(
    "portfolio_projects",
    "image_file_id"
  );

  await normalizeNumericColumn(
    "portfolio_certificates",
    "image_file_id"
  );

  await normalizeNumericColumn(
    "portfolio_certificates",
    "file_id"
  );

  await normalizeNumericColumn(
    "portfolio_resumes",
    "file_id"
  );

  await seedLegacyProjects();
  await seedDefaultProjects();
}

async function ensurePortfolioFileIdIsBigInt() {
  const result = await db.query(`
    SELECT udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'portfolio_files'
      AND column_name = 'id'
    LIMIT 1
  `);

  const current = String(result.rows[0]?.udt_name ?? "");

  if (!current || current === "int8") {
    return;
  }

  /*
   * Numeric legacy IDs can be converted directly.
   */
  if (["int2", "int4", "numeric"].includes(current)) {
    await db.query(`
      ALTER TABLE public.portfolio_files
        ALTER COLUMN id TYPE BIGINT
        USING id::text::BIGINT;
    `);
  } else {
    /*
     * UUID/text IDs cannot be cast to BIGINT.
     *
     * Give every existing file a new numeric ID without touching:
     * - file_name
     * - mime_type
     * - size_bytes
     * - data
     * - protected
     * - created_at
     */
    await db.query(`
      ALTER TABLE public.portfolio_files
        ADD COLUMN IF NOT EXISTS __new_file_id BIGINT;

      WITH numbered AS (
        SELECT
          ctid,
          ROW_NUMBER() OVER (
            ORDER BY created_at ASC, id::text ASC
          ) AS new_id
        FROM public.portfolio_files
      )
      UPDATE public.portfolio_files AS pf
      SET __new_file_id = numbered.new_id
      FROM numbered
      WHERE pf.ctid = numbered.ctid;
    `);

    /*
     * Remove any primary-key constraint currently attached
     * to the old ID.
     */
    await db.query(`
      DO $$
      DECLARE
        pk RECORD;
      BEGIN
        FOR pk IN
          SELECT conname
          FROM pg_constraint
          WHERE contype = 'p'
            AND conrelid = 'public.portfolio_files'::regclass
        LOOP
          EXECUTE format(
            'ALTER TABLE public.portfolio_files DROP CONSTRAINT IF EXISTS %I',
            pk.conname
          );
        END LOOP;
      END $$;
    `);

    await db.query(`
      ALTER TABLE public.portfolio_files
        DROP COLUMN id;

      ALTER TABLE public.portfolio_files
        RENAME COLUMN __new_file_id TO id;

      ALTER TABLE public.portfolio_files
        ALTER COLUMN id SET NOT NULL;

      ALTER TABLE public.portfolio_files
        ADD PRIMARY KEY (id);
    `);
  }

  /*
   * Make sure future portfolio_files rows get numeric IDs.
   */
  await db.query(`
    CREATE SEQUENCE IF NOT EXISTS public.portfolio_files_id_seq;

    SELECT setval(
      'public.portfolio_files_id_seq',
      COALESCE(
        (SELECT MAX(id) FROM public.portfolio_files),
        0
      ),
      COALESCE(
        (SELECT MAX(id) FROM public.portfolio_files),
        0
      ) > 0
    );

    ALTER TABLE public.portfolio_files
      ALTER COLUMN id
      SET DEFAULT nextval('public.portfolio_files_id_seq');

    ALTER SEQUENCE public.portfolio_files_id_seq
      OWNED BY public.portfolio_files.id;
  `);
}

async function normalizeNumericColumn(
  table: string,
  column: string,
  primaryKey = false
) {
  const result = await db.query(
    `
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
        AND column_name = $2
      LIMIT 1
    `,
    [table, column]
  );

  const current = result.rows[0];

  if (!current || current.udt_name === "int8") {
    return;
  }

  /*
   * A UUID/text identifier cannot safely become a bigint primary key.
   *
   * File uploads in this project are numeric IDs, so leave unusual
   * legacy identifiers alone instead of making the whole schema migration fail.
   */
  const numericTypes = new Set([
    "int2",
    "int4",
    "int8",
    "numeric",
  ]);

  if (!numericTypes.has(String(current.udt_name))) {
    if (primaryKey) {
      return;
    }
  }

  const qualifiedTable =
    `"${table.replace(/"/g, '""')}"`;

  const qualifiedColumn =
    `"${column.replace(/"/g, '""')}"`;

  const usingExpression = `
    CASE
      WHEN ${qualifiedColumn} IS NULL THEN NULL
      WHEN ${qualifiedColumn}::text ~ '^[0-9]+$'
        THEN ${qualifiedColumn}::text::BIGINT
      ELSE NULL
    END
  `;

  await db.query(`
    ALTER TABLE public.${qualifiedTable}
      ALTER COLUMN ${qualifiedColumn}
      TYPE BIGINT
      USING ${usingExpression};
  `);
}

async function seedLegacyProjects() {
  const count = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM public.portfolio_projects`
  );

  if (Number(count.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const exists = await db.query(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'project'
    ) AS exists
  `);

  if (!exists.rows[0]?.exists) {
    return;
  }

  try {
    const result = await db.query(
      `SELECT * FROM public.project LIMIT 100`
    );

    for (const row of result.rows) {
      const title = String(
        row.title ??
        row.name ??
        "Project"
      );

      const slug =
        String(
          row.slug ??
          title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        ) || `project-${Date.now()}`;

      const tech = parseJsonArray(row.technologies);
      const gallery = parseJsonArray(row.gallery);

      await db.query(
        `
          INSERT INTO public.portfolio_projects
          (
            slug,
            title,
            short_title,
            description,
            overview,
            work_done,
            methodology,
            insights,
            outcome,
            category,
            technologies,
            image_url,
            gallery,
            github_url,
            live_url,
            project_file_url,
            featured,
            published,
            sort_order
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11::jsonb,
            $12,
            $13::jsonb,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19
          )
          ON CONFLICT (slug) DO NOTHING
        `,
        [
          slug,
          title,
          String(row.shortTitle ?? title),
          String(row.description ?? ""),
          row.overview ?? null,
          row.workDone ?? null,
          row.methodology ?? null,
          row.insights ?? null,
          row.outcome ?? null,
          String(
            row.category ?? "Data Analytics"
          ),
          JSON.stringify(tech),
          row.image ?? row.imageUrl ?? null,
          JSON.stringify(gallery),
          row.githubUrl ?? null,
          row.liveUrl ?? null,
          row.driveUrl ?? null,
          Boolean(row.featured),
          row.published !== false,
          Number(row.sortOrder ?? 0),
        ]
      );
    }
  } catch (error) {
    console.warn(
      "Legacy project seed skipped:",
      error
    );
  }
}

async function seedDefaultProjects() {
  const count = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM public.portfolio_projects`
  );

  if (Number(count.rows[0]?.count ?? 0) > 0) {
    return;
  }

  const projects = [
    {
      slug: "swiggy-sales-dashboard",
      title: "Swiggy Sales Dashboard",
      category: "Excel",
      image: "/projects/swiggy.png",
      order: 1,
    },
    {
      slug: "hr-analytics-dashboard",
      title: "HR Analytics Dashboard",
      category: "Excel",
      image: "/projects/hr.png",
      order: 2,
    },
    {
      slug: "blinkit-sales-dashboard",
      title: "Blinkit Sales Dashboard",
      category: "Excel",
      image: "/projects/blinkit.png",
      order: 3,
    },
    {
      slug: "starbucks-analytics-dashboard",
      title: "Starbucks Analytics Dashboard",
      category: "Power BI",
      image: "/projects/starbucks-dashboard.png",
      order: 4,
    },
    {
      slug: "phonepe-transaction-analytics-dashboard",
      title: "PhonePe Transaction Analytics Dashboard",
      category: "Power BI",
      image: "/projects/phonepe.png",
      order: 5,
    },
  ];

  for (const project of projects) {
    await db.query(
      `
        INSERT INTO public.portfolio_projects
        (
          slug,
          title,
          short_title,
          description,
          category,
          image_url,
          technologies,
          gallery,
          featured,
          published,
          sort_order
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::jsonb,
          $8::jsonb,
          $9,
          $10,
          $11
        )
        ON CONFLICT (slug) DO NOTHING
      `,
      [
        project.slug,
        project.title,
        project.title,
        `${project.title} — portfolio analytics project.`,
        project.category,
        project.image,
        JSON.stringify(
          project.category === "Power BI"
            ? [
                "Power BI",
                "DAX",
                "Data Analytics",
              ]
            : [
                "Excel",
                "Data Analytics",
                "Dashboard",
              ]
        ),
        JSON.stringify([project.image]),
        project.order === 1,
        true,
        project.order,
      ]
    );
  }
}

function parseJsonArray(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
  } catch {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}