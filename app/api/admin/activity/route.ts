import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { isAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function GET(){if(!(await isAdmin()))return NextResponse.json({error:"Unauthorized"},{status:401});try{await ensurePortfolioSchema();const[downloads,calls]=await Promise.all([db.query(`SELECT id,project_title,email,verified_at,downloaded_at,created_at FROM project_download_requests ORDER BY created_at DESC`),db.query(`SELECT id,name,email,phone,preferred_time,reason,status,created_at FROM call_requests ORDER BY created_at DESC`)]);return NextResponse.json({downloads:downloads.rows,calls:calls.rows})}catch(e){console.error(e);return NextResponse.json({downloads:[],calls:[]},{status:500})}}
