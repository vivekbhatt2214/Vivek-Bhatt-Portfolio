import { NextRequest, NextResponse } from "next/server";
import { adminCookie, verifyAdminToken } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const token = request.cookies.get(adminCookie)?.value;
  return NextResponse.json({loggedIn:verifyAdminToken(token)},{headers:{"Cache-Control":"no-store"}});
}
