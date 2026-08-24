import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";
export const runtime = "nodejs";
export async function POST() {
  const response = NextResponse.json({success:true});
  response.cookies.set(adminCookie,"",{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"lax",maxAge:0,path:"/"});
  return response;
}
