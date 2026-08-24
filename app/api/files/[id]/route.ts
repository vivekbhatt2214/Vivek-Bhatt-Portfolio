import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { verifyDownloadToken } from "@/lib/download-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensurePortfolioSchema();

    const { id } = await context.params;
    const cleanId = decodeURIComponent(String(id || "")).trim();

    if (!cleanId) return new NextResponse("Not found", { status: 404 });

    const result = await db.query(
      `
        SELECT file_name, mime_type, size_bytes, data, protected
        FROM portfolio_files
        WHERE id = $1
        LIMIT 1
      `,
      [cleanId]
    );

    const row = result.rows[0];
    if (!row) return new NextResponse("Not found", { status: 404 });

    if (row.protected) {
      const requestId = Number(request.nextUrl.searchParams.get("request") || 0);
      const token = request.nextUrl.searchParams.get("token") || "";
      const numericId = Number(cleanId);

      if (
        !requestId ||
        !Number.isFinite(numericId) ||
        !verifyDownloadToken(token, requestId, numericId)
      ) {
        return new NextResponse("Verification required", { status: 403 });
      }
    }

    const disposition =
      request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

    return new NextResponse(new Blob([row.data]), {
      headers: {
        "Content-Type": row.mime_type || "application/octet-stream",
        "Content-Length": String(row.size_bytes),
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("File GET error:", error);
    return new NextResponse("Unable to load file", { status: 500 });
  }
}
