import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, adminCookie, adminMaxAge } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import crypto from "node:crypto";

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
    if (!(identifier === email || identifier === username)) {
      return NextResponse.json({success:false,message:"Invalid username/email or password."},{status:401});
    }

    let validPassword = password === adminPassword;
    try {
      await ensurePortfolioSchema();
      const stored = await db.query(`SELECT password_hash FROM public.admin_password_credentials WHERE id=1 LIMIT 1`);
      const storedHash = String(stored.rows[0]?.password_hash || "");
      if (storedHash.startsWith("scrypt:")) {
        const [, salt, derived] = storedHash.split(":");
        const check = crypto.scryptSync(password, salt, 64).toString("hex");
        validPassword = crypto.timingSafeEqual(Buffer.from(check), Buffer.from(derived));
      }
    } catch (error) {
      console.warn("Stored admin password check skipped:", error);
    }

    if (!validPassword) {
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
