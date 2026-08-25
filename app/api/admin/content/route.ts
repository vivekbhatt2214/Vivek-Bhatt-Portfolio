import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const text = (value: FormDataEntryValue | null) =>
  String(value ?? "").trim();

const bool = (value: FormDataEntryValue | null) =>
  ["true", "1", "on", "yes"].includes(text(value).toLowerCase());

const numberOrNull = (value: FormDataEntryValue | null) => {
  const raw = text(value);

  if (!raw) return null;

  const valueAsNumber = Number(raw);

  return Number.isFinite(valueAsNumber) && valueAsNumber > 0
    ? valueAsNumber
    : null;
};

// Content record IDs may come from an older PostgreSQL schema where the
// primary key was UUID/text instead of BIGINT. Never convert those IDs with
// Number(), because UUIDs become NaN and an edit silently turns into an insert.
const recordId = (value: FormDataEntryValue | null) => {
  const raw = text(value);
  return raw || null;
};

const arr = (value: FormDataEntryValue | null) => {
  const raw = text(value);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    // Continue with comma-separated input.
  }

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

async function fileExists(id: number | null) {
  if (!id) return false;

  const result = await db.query(
    `SELECT id FROM portfolio_files WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rowCount === 1;
}

/**
 * Return a normal browser-view URL for a stored file.
 *
 * IMPORTANT:
 * Do not append ?download=1 here.
 * The same file endpoint can then be opened in the browser for
 * preview/view functionality.
 */
function fileViewUrl(id: number | null) {
  return id ? `/api/files/${encodeURIComponent(String(id))}` : null;
}

/**
 * Return a forced-download URL.
 *
 * This is kept available for consumers that explicitly need download mode.
 */
function fileDownloadUrl(id: number | null) {
  return id
    ? `/api/files/${encodeURIComponent(String(id))}?download=1`
    : null;
}

/**
 * Convert a possible database/file ID into a valid positive bigint-like
 * number for portfolio_files references.
 */
function normalizeFileId(value: unknown): number | null {
  if (value == null) return null;

  const raw = String(value).trim();

  if (!raw) return null;

  const numeric = Number(raw);

  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensurePortfolioSchema();

    const [projects, certificates, resumes] = await Promise.all([
      db.query(`
        SELECT
          id,
          slug,
          title,
          short_title AS "shortTitle",
          category,
          description,
          overview,
          work_done AS "workDone",
          methodology,
          insights,
          outcome,
          technologies,
          image_url AS "imageUrl",
          image_file_id AS "imageFileId",
          gallery,
          github_url AS "githubUrl",
          live_url AS "liveUrl",
          COALESCE(
            NULLIF(project_file_url, ''),
            CASE
              WHEN project_file_id IS NOT NULL
              THEN '/api/files/' || project_file_id::text || '?download=1'
            END
          ) AS "projectFileUrl",
          project_file_name AS "projectFileName",
          project_file_type AS "projectFileType",
          project_file_id AS "projectFileId",
          featured,
          published,
          sort_order AS "sortOrder"
        FROM portfolio_projects
        ORDER BY sort_order ASC, id DESC
      `),

      db.query(`
        SELECT
          id,
          title,
          issuer,
          issue_date AS "issueDate",
          credential_id AS "credentialId",
          credential_url AS "credentialUrl",
          image_url AS "imageUrl",
          file_url AS "fileUrl",
          image_file_id AS "imageFileId",
          file_id AS "fileId",
          description,
          published,
          sort_order AS "sortOrder"
        FROM portfolio_certificates
        ORDER BY sort_order ASC, id DESC
      `),

      db.query(`
        SELECT
          id,
          title,
          version,
          description,
          file_url AS "fileUrl",
          file_name AS "fileName",
          file_id AS "fileId",
          published,
          created_at AS "createdAt"
        FROM portfolio_resumes
        ORDER BY published DESC, id DESC
      `),
    ]);

    const normalizeRows = (rows: any[]) =>
      rows.map((row) => ({
        ...row,

        // Keep record IDs as strings because some old schemas use UUID.
        id: row.id == null ? null : String(row.id),

        imageFileId:
          row.imageFileId == null ? null : String(row.imageFileId),

        fileId:
          row.fileId == null ? null : String(row.fileId),

        projectFileId:
          row.projectFileId == null
            ? null
            : String(row.projectFileId),

        /**
         * Resume:
         * If it has a stored file_id, always expose a browser-view URL.
         * Do NOT force download here.
         */
        ...(row.fileId != null && String(row.fileId).trim()
          ? {
              fileUrl:
                fileViewUrl(normalizeFileId(row.fileId)) ||
                row.fileUrl ||
                null,
            }
          : {}),

        /**
         * Certificate:
         * If a certificate image/file exists in portfolio_files,
         * expose the corresponding normal view URL.
         */
        ...(row.imageFileId != null && String(row.imageFileId).trim()
          ? {
              imageUrl:
                fileViewUrl(normalizeFileId(row.imageFileId)) ||
                row.imageUrl ||
                null,
            }
          : {}),

        ...(row.fileId != null && String(row.fileId).trim()
          ? {
              fileUrl:
                fileViewUrl(normalizeFileId(row.fileId)) ||
                row.fileUrl ||
                null,
            }
          : {}),
      }));

    return NextResponse.json(
      {
        projects: normalizeRows(projects.rows),
        certificates: normalizeRows(certificates.rows),
        resumes: normalizeRows(resumes.rows),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin content GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load content.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await ensurePortfolioSchema();

    const form = await request.formData();

    const type = text(form.get("type"));
    const id = recordId(form.get("id"));

    /* ============================================================
       PROJECT
       ============================================================ */

    if (type === "project") {
      const title = text(form.get("title"));

      if (!title) {
        return NextResponse.json(
          { error: "Project title is required." },
          { status: 400 }
        );
      }

      const slug = (
        text(form.get("slug")) ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      ).toLowerCase();

      if (!slug) {
        return NextResponse.json(
          { error: "A valid project slug is required." },
          { status: 400 }
        );
      }

      let imageFileId = numberOrNull(form.get("imageFileId"));
      let projectFileId = numberOrNull(form.get("projectFileId"));

      // When editing an existing project, an upload is optional.
      // Preserve the existing database values if no new file was uploaded.
      let existingProject: any = null;

      if (id) {
        const existingResult = await db.query(
          `
            SELECT
              image_url,
              image_file_id,
              project_file_url,
              project_file_name,
              project_file_type,
              project_file_id
            FROM portfolio_projects
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

        existingProject = existingResult.rows[0] ?? null;
      }

      if (!imageFileId && existingProject?.image_file_id != null) {
        const existingId = Number(existingProject.image_file_id);

        if (Number.isFinite(existingId) && existingId > 0) {
          imageFileId = existingId;
        }
      }

      if (!projectFileId && existingProject?.project_file_id != null) {
        const existingId = Number(
          existingProject.project_file_id
        );

        if (Number.isFinite(existingId) && existingId > 0) {
          projectFileId = existingId;
        }
      }

      // Older records can contain a file ID whose binary was removed.
      // Do not let an invalid old reference block the update.
      if (
        imageFileId &&
        !(await fileExists(imageFileId))
      ) {
        imageFileId = null;
      }

      if (
        projectFileId &&
        !(await fileExists(projectFileId))
      ) {
        projectFileId = null;
      }

      const rawImage =
        text(form.get("image")) ||
        text(form.get("imageUrl")) ||
        text(existingProject?.image_url);

      const rawProjectFileUrl =
        text(form.get("projectFileUrl")) ||
        text(existingProject?.project_file_url);

      // PostgreSQL file reference is authoritative.
      const imageUrl = imageFileId
        ? fileViewUrl(imageFileId)
        : rawImage &&
            !rawImage.startsWith("/api/files/")
          ? rawImage
          : null;

      const projectFileUrl = projectFileId
        ? fileDownloadUrl(projectFileId)
        : rawProjectFileUrl &&
            !rawProjectFileUrl.startsWith("/api/files/")
          ? rawProjectFileUrl
          : null;

      const values = [
        slug,
        title,
        text(form.get("shortTitle")) || title,
        text(form.get("description")),
        text(form.get("overview")) || null,
        text(form.get("workDone")) || null,
        text(form.get("methodology")) || null,
        text(form.get("insights")) || null,
        text(form.get("outcome")) || null,
        text(form.get("category")) || "Data Analytics",
        JSON.stringify(arr(form.get("technologies"))),
        imageUrl,
        JSON.stringify(arr(form.get("gallery"))),
        text(form.get("githubUrl")) || null,
        text(form.get("liveUrl")) || null,
        projectFileUrl,
        text(form.get("projectFileName")) ||
          text(existingProject?.project_file_name) ||
          null,
        text(form.get("projectFileType")) ||
          text(existingProject?.project_file_type) ||
          null,
        projectFileId,
        imageFileId,
        bool(form.get("featured")),
        bool(form.get("published")),
        Number(form.get("sortOrder")) || 0,
      ];

      if (id) {
        const result = await db.query(
          `
            UPDATE portfolio_projects
            SET
              slug = $1,
              title = $2,
              short_title = $3,
              description = $4,
              overview = $5,
              work_done = $6,
              methodology = $7,
              insights = $8,
              outcome = $9,
              category = $10,
              technologies = $11::jsonb,
              image_url = $12,
              gallery = $13::jsonb,
              github_url = $14,
              live_url = $15,
              project_file_url = $16,
              project_file_name = $17,
              project_file_type = $18,
              project_file_id = $19,
              image_file_id = $20,
              featured = $21,
              published = $22,
              sort_order = $23,
              updated_at = NOW()
            WHERE id = $24
            RETURNING id
          `,
          [...values, id]
        );

        if (result.rowCount !== 1) {
          return NextResponse.json(
            {
              error:
                "Project was not found, so nothing was updated.",
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          mode: "updated",
          id: String(result.rows[0].id),
          message:
            "Project updated successfully. Refresh the portfolio to see the changes.",
        });
      }

      const result = await db.query(
        `
          INSERT INTO portfolio_projects
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
            project_file_name,
            project_file_type,
            project_file_id,
            image_file_id,
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
            $19,
            $20,
            $21,
            $22,
            $23
          )
          RETURNING id
        `,
        values
      );

      return NextResponse.json({
        success: true,
        mode: "created",
        id: String(result.rows[0].id),
        message: "Project published successfully.",
      });
    }

    /* ============================================================
       CERTIFICATE
       ============================================================ */

    if (type === "certificate") {
      const title = text(form.get("title"));

      if (!title) {
        return NextResponse.json(
          { error: "Certificate title is required." },
          { status: 400 }
        );
      }

      /**
       * New upload IDs.
       */
      let imageFileId = numberOrNull(
        form.get("imageFileId")
      );

      let fileId = numberOrNull(
        form.get("fileId")
      );

      /**
       * When editing an existing certificate without uploading
       * a new image/file, preserve the old references.
       */
      let existingCertificate: any = null;

      if (id) {
        const existingResult = await db.query(
          `
            SELECT
              image_url,
              file_url,
              image_file_id,
              file_id
            FROM portfolio_certificates
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

        existingCertificate =
          existingResult.rows[0] ?? null;
      }

      if (
        !imageFileId &&
        existingCertificate?.image_file_id != null
      ) {
        const existingId = Number(
          existingCertificate.image_file_id
        );

        if (
          Number.isFinite(existingId) &&
          existingId > 0
        ) {
          imageFileId = existingId;
        }
      }

      if (
        !fileId &&
        existingCertificate?.file_id != null
      ) {
        const existingId = Number(
          existingCertificate.file_id
        );

        if (
          Number.isFinite(existingId) &&
          existingId > 0
        ) {
          fileId = existingId;
        }
      }

      /**
       * Validate uploaded files.
       */
      if (
        imageFileId &&
        !(await fileExists(imageFileId))
      ) {
        return NextResponse.json(
          {
            error:
              "Certificate image is unavailable. Please upload it again.",
          },
          { status: 400 }
        );
      }

      if (
        fileId &&
        !(await fileExists(fileId))
      ) {
        return NextResponse.json(
          {
            error:
              "Certificate file is unavailable. Please upload it again.",
          },
          { status: 400 }
        );
      }

      /**
       * File URL priority:
       *
       * 1. New/existing PostgreSQL file
       * 2. Existing/supplied normal URL
       *
       * Certificate image should be VIEWABLE in browser.
       * Certificate PDF/file can still use download mode because
       * this is the certificate file action, not the image preview.
       */
      const imageUrl = imageFileId
        ? fileViewUrl(imageFileId)
        : text(form.get("imageUrl")) ||
          text(existingCertificate?.image_url) ||
          null;

      const fileUrl = fileId
        ? fileDownloadUrl(fileId)
        : text(form.get("fileUrl")) ||
          text(existingCertificate?.file_url) ||
          null;

      const values = [
        title,
        text(form.get("issuer")) || null,
        text(form.get("issueDate")) || null,
        text(form.get("credentialId")) || null,
        text(form.get("credentialUrl")) || null,
        imageUrl,
        fileUrl,
        imageFileId,
        fileId,
        text(form.get("description")) || null,
        bool(form.get("published")),
        Number(form.get("sortOrder")) || 0,
      ];

      const query = id
        ? `
            UPDATE portfolio_certificates
            SET
              title = $1,
              issuer = $2,
              issue_date = $3,
              credential_id = $4,
              credential_url = $5,
              image_url = $6,
              file_url = $7,
              image_file_id = $8,
              file_id = $9,
              description = $10,
              published = $11,
              sort_order = $12,
              updated_at = NOW()
            WHERE id = $13
            RETURNING id
          `
        : `
            INSERT INTO portfolio_certificates
            (
              title,
              issuer,
              issue_date,
              credential_id,
              credential_url,
              image_url,
              file_url,
              image_file_id,
              file_id,
              description,
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
              $11,
              $12
            )
            RETURNING id
          `;

      const result = await db.query(
        query,
        id ? [...values, id] : values
      );

      if (result.rowCount !== 1) {
        return NextResponse.json(
          {
            error:
              "Certificate could not be saved.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: id ? "updated" : "created",
        id: String(result.rows[0].id),
        message:
          "Certificate saved successfully.",
      });
    }

    /* ============================================================
       RESUME
       ============================================================ */

    if (type === "resume") {
      const title = text(form.get("title"));

      let fileId = numberOrNull(
        form.get("fileId")
      );

      let fileUrl = text(form.get("fileUrl"));

      /**
       * When editing a resume without selecting a new PDF,
       * preserve the current PDF.
       */
      let existingResume: any = null;

      if (id) {
        const existingResult = await db.query(
          `
            SELECT
              file_url,
              file_name,
              file_id
            FROM portfolio_resumes
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

        existingResume =
          existingResult.rows[0] ?? null;
      }

      if (
        !fileId &&
        existingResume?.file_id != null
      ) {
        const existingId = Number(
          existingResume.file_id
        );

        if (
          Number.isFinite(existingId) &&
          existingId > 0
        ) {
          fileId = existingId;
        }
      }

      if (!fileUrl) {
        fileUrl =
          text(existingResume?.file_url) || "";
      }

      /**
       * IMPORTANT:
       * Resume file URL is a VIEW URL.
       * Do not save ?download=1 here.
       *
       * This fixes:
       * View Resume -> browser preview
       * instead of immediately downloading.
       */
      if (fileId) {
        fileUrl = fileViewUrl(fileId) || "";
      }

      if (!title || (!fileUrl && !fileId)) {
        return NextResponse.json(
          {
            error:
              "Resume title and PDF are required.",
          },
          { status: 400 }
        );
      }

      if (
        fileId &&
        !(await fileExists(fileId))
      ) {
        return NextResponse.json(
          {
            error:
              "Resume file is unavailable. Please upload it again.",
          },
          { status: 400 }
        );
      }

      const values = [
        title,
        text(form.get("version")) ||
          text(existingResume?.version) ||
          null,
        text(form.get("description")) ||
          text(existingResume?.description) ||
          null,
        fileUrl,
        text(form.get("fileName")) ||
          text(existingResume?.file_name) ||
          null,
        fileId,
        bool(form.get("published")),
      ];

      /**
       * Only one resume can be published.
       */
      if (bool(form.get("published"))) {
        await db.query(
          `UPDATE portfolio_resumes SET published=FALSE`
        );
      }

      const query = id
        ? `
            UPDATE portfolio_resumes
            SET
              title = $1,
              version = $2,
              description = $3,
              file_url = $4,
              file_name = $5,
              file_id = $6,
              published = $7,
              updated_at = NOW()
            WHERE id = $8
            RETURNING id
          `
        : `
            INSERT INTO portfolio_resumes
            (
              title,
              version,
              description,
              file_url,
              file_name,
              file_id,
              published
            )
            VALUES
            (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7
            )
            RETURNING id
          `;

      const result = await db.query(
        query,
        id ? [...values, id] : values
      );

      if (result.rowCount !== 1) {
        return NextResponse.json(
          {
            error:
              "Resume could not be saved.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: id ? "updated" : "created",
        id: String(result.rows[0].id),
        message:
          "Resume saved successfully.",
      });
    }

    return NextResponse.json(
      { error: "Unknown content type." },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Admin content POST error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save content.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await ensurePortfolioSchema();

    const body = await request.json();

    /**
     * Support the normal `id` field.
     *
     * Also accept type-specific ID names so that the API remains
     * tolerant if the admin UI sends certificateId/resumeId/projectId.
     */
    const type = String(body.type || "")
      .trim()
      .toLowerCase();

    const id = String(
      body.id ??
        body.projectId ??
        body.certificateId ??
        body.resumeId ??
        ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const table =
      type === "project"
        ? "portfolio_projects"
        : type === "certificate"
          ? "portfolio_certificates"
          : type === "resume"
            ? "portfolio_resumes"
            : "";

    if (!table) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    /**
     * First verify that the actual content record exists.
     *
     * This is important because PostgreSQL UUID IDs must be treated
     * as strings and should never be passed through Number().
     */
    const existing = await db.query(
      `SELECT id FROM ${table} WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (existing.rowCount !== 1) {
      return NextResponse.json(
        {
          error:
            "The selected item was not found. Please refresh the page and try again.",
        },
        { status: 404 }
      );
    }

    /**
     * Delete the content record.
     *
     * We intentionally do NOT delete portfolio_files here.
     *
     * Reason:
     * The same uploaded file may still be referenced by another
     * record or may be needed by an existing portfolio item.
     */
    const result = await db.query(
      `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount !== 1) {
      return NextResponse.json(
        {
          error:
            "Unable to delete the selected item.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: String(result.rows[0].id),
      message:
        type === "certificate"
          ? "Certificate deleted successfully."
          : type === "resume"
            ? "Resume deleted successfully."
            : "Project deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin content DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete item.",
      },
      { status: 500 }
    );
  }
}