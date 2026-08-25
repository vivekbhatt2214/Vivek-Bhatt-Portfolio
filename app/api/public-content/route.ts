import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensurePortfolioSchema();

    const [certificates, resumes] =
      await Promise.all([
        db.query(`
          SELECT
            id,
            title,
            issuer,
            issue_date AS "issueDate",
            credential_id AS "credentialId",
            credential_url AS "credentialUrl",

            COALESCE(
              CASE
                WHEN image_file_id IS NOT NULL
                THEN '/api/files/' || image_file_id::text
              END,
              NULLIF(image_url, '')
            ) AS image,

            COALESCE(
              CASE
                WHEN file_id IS NOT NULL
                THEN '/api/files/' || file_id::text
              END,
              NULLIF(file_url, '')
            ) AS "fileUrl",

            description,
            published,
            sort_order AS "sortOrder"

          FROM portfolio_certificates

          WHERE published = TRUE

          ORDER BY
            sort_order ASC,
            created_at DESC
        `),

        db.query(`
          SELECT
            id,
            title,
            version,
            description,

            /*
             * NORMAL VIEW URL
             *
             * No ?download=1 here.
             *
             * Browser will open PDF normally.
             */
            COALESCE(
              CASE
                WHEN file_id IS NOT NULL
                THEN '/api/files/' || file_id::text
              END,
              NULLIF(
                REGEXP_REPLACE(
                  COALESCE(file_url, ''),
                  '[?&]download=1',
                  '',
                  'g'
                ),
                ''
              )
            ) AS "fileUrl",

            file_name AS "fileName",

            /*
             * DOWNLOAD URL
             *
             * ?download=1 is used ONLY here.
             */
            CASE
              WHEN file_id IS NOT NULL
              THEN '/api/files/'
                   || file_id::text
                   || '?download=1'

              WHEN NULLIF(file_url, '') IS NOT NULL
              THEN
                CASE
                  WHEN file_url LIKE '%?%'
                  THEN file_url || '&download=1'
                  ELSE file_url || '?download=1'
                END

              ELSE NULL
            END AS "downloadUrl"

          FROM portfolio_resumes

          WHERE published = TRUE

          ORDER BY
            created_at DESC

          LIMIT 1
        `),
      ]);

    return NextResponse.json(
      {
        certificates:
          certificates.rows,

        resume:
          resumes.rows[0] ?? null,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Public content GET error:",
      error
    );

    /*
     * Don't break the portfolio if
     * database/API temporarily fails.
     */
    return NextResponse.json(
      {
        certificates: [],
        resume: null,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }
}