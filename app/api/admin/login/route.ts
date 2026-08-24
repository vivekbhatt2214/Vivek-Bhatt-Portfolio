import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, adminCookie, adminMaxAge } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || "").trim().toLowerCase();
    const password = String(body.password || "");
    const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const username = String(process.env.ADMIN_USERNAME || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");

    if (!email || !username || !adminPassword) {
      return NextResponse.json({ success:false, message:"Admin login is not configured. Add ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD to .env." },{status:500});
    }
    if (!((identifier === email || identifier === username) && password === adminPassword)) {
      return NextResponse.json({success:false,message:"Invalid username/email or password."},{status:401});
    }

    const response = NextResponse.json({success:true,message:"Login successful."});
    response.cookies.set(adminCookie,createAdminToken(),{
      httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax",maxAge:adminMaxAge,path:"/"
    });
    return response;
  } catch(error) {
    console.error(error);
    return NextResponse.json({success:false,message:"Unable to sign in."},{status:500});
  }
}
