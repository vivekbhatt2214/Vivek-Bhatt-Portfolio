import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
import { createDownloadToken } from "@/lib/download-auth";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    await ensurePortfolioSchema();
    const {id,otp}=await request.json();
    const cleanOtp=String(otp||"").trim();
    const result=await db.query(`SELECT id,otp_hash,otp_expires_at,file_url,project_id FROM project_download_requests WHERE id=$1 LIMIT 1`,[id]);
    const row=result.rows[0];
    if(!row) return NextResponse.json({error:"Download request not found."},{status:404});
    if(!row.otp_expires_at || new Date(row.otp_expires_at).getTime()<Date.now()) return NextResponse.json({error:"Verification code has expired. Please request a new code."},{status:400});
    const hash=crypto.createHash("sha256").update(cleanOtp).digest("hex");
    if(hash!==row.otp_hash) return NextResponse.json({error:"Invalid verification code."},{status:400});
    await db.query(`UPDATE project_download_requests SET verified_at=NOW(),downloaded_at=NOW() WHERE id=$1`,[id]);
    let downloadUrl=String(row.file_url||"");
    if(downloadUrl.startsWith("/api/files/")){const fileId=Number(downloadUrl.split("/").pop()?.split("?")[0]||0);if(fileId){const token=createDownloadToken(Number(id),fileId);downloadUrl=`/api/files/${fileId}?download=1&request=${id}&token=${encodeURIComponent(token)}`;}}
    return NextResponse.json({success:true,downloadUrl});
  }catch(error){console.error(error);return NextResponse.json({error:"Unable to verify code."},{status:500});}
}
