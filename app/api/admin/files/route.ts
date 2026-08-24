import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // This also repairs older portfolio_files.id schemas before the INSERT.
    await ensurePortfolioSchema();

    const form = await request.formData();
    const file = form.get("file");
    const protectedFile = ["true", "1", "yes", "on"].includes(
      String(form.get("protected") || "").toLowerCase()
    );

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Empty files are not allowed." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum supported size is 25 MB per upload." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!buffer.length) {
      return NextResponse.json({ error: "The selected file contains no data." }, { status: 400 });
    }

    const result = await db.query(
      `
        INSERT INTO portfolio_files
          (file_name, mime_type, size_bytes, data, protected)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING id, file_name, mime_type, size_bytes
      `,
      [
        file.name,
        file.type || "application/octet-stream",
        buffer.length,
        buffer,
        protectedFile,
      ]
    );

    const row = result.rows[0];
    if (!row?.id) {
      throw new Error("PostgreSQL inserted the file but did not return an ID.");
    }

    const id = String(row.id);

    return NextResponse.json(
      {
        success: true,
        file: {
          id,
          name: String(row.file_name),
          mime: String(row.mime_type),
          size: Number(row.size_bytes),
          url: `/api/files/${encodeURIComponent(id)}`,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("File upload error:", error);

    const message = error instanceof Error ? error.message : "Unknown database error.";

    return NextResponse.json(
      {
        error: "Unable to store file in PostgreSQL.",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {}),
      },
      { status: 500 }
    );
  }
}
