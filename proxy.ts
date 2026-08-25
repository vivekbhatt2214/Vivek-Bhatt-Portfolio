import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, adminCookie } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(adminCookie)?.value;
    if (!verifyAdminToken(token)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
