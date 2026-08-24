import { NextResponse } from "next/server";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    await ensurePortfolioSchema();
    const {slug,email}=await request.json();
    const cleanEmail=String(email||"").trim().toLowerCase();
    const cleanSlug=String(slug||"").trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({error:"Please enter a valid email address."},{status:400});
    const project=await db.query(`SELECT id,slug,title,project_file_id AS "fileId",project_file_url AS "fileUrl" FROM portfolio_projects WHERE slug=$1 AND published=TRUE LIMIT 1`,[cleanSlug]);
    const row=project.rows[0];
    if(!row || (!row.fileId && !row.fileUrl)) return NextResponse.json({error:"Project files are not available for this project yet."},{status:404});
    const otp=String(Math.floor(100000+Math.random()*900000));
    const expires=new Date(Date.now()+10*60*1000);
    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");
    const inserted=await db.query(`INSERT INTO project_download_requests (project_id,project_slug,project_title,email,otp_hash,otp_expires_at,file_url) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[row.id,row.slug,row.title,cleanEmail,otpHash,expires,row.fileId?`/api/files/${row.fileId}?download=1`:row.fileUrl]);
    const gmailUser=process.env.GMAIL_USER; const gmailPass=process.env.GMAIL_APP_PASSWORD;
    if(!gmailUser || !gmailPass) return NextResponse.json({error:"Email verification is not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD."},{status:500});
    const transporter=nodemailer.createTransport({service:"gmail",auth:{user:gmailUser,pass:gmailPass}});
    await transporter.sendMail({from:`"Vivek Bhatt Portfolio" <${process.env.CONTACT_FROM_EMAIL||gmailUser}>`,to:cleanEmail,subject:`Verify project download — ${row.title}`,html:`<div style="font-family:Arial;background:#050816;color:#fff;padding:35px"><div style="max-width:560px;margin:auto;background:#0d1426;border:1px solid #1f2c45;border-radius:20px;padding:32px"><div style="color:#00e5ff;font-size:11px;letter-spacing:2px;font-weight:700">PROJECT FILE ACCESS</div><h2>Verify your email</h2><p style="color:#94a3b8">Use this code to download <b style="color:#fff">${escapeHtml(row.title)}</b>.</p><div style="margin:25px 0;padding:22px;text-align:center;background:#080e1c;border:1px solid #24324c;border-radius:14px;font-size:34px;letter-spacing:9px;color:#00e5ff;font-weight:800">${otp}</div><p style="color:#64748b">This code expires in 10 minutes.</p></div></div>`});
    return NextResponse.json({success:true,id:inserted.rows[0].id,message:"Verification code sent to your email."});
  }catch(error){console.error(error);return NextResponse.json({error:error instanceof Error?error.message:"Unable to send verification code."},{status:500});}
}
function escapeHtml(v:string){return v.replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]||m));}
