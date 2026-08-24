import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { ensurePortfolioSchema } from "@/lib/schema";
export const runtime="nodejs";
export async function POST(request:Request){
  try{await ensurePortfolioSchema(); const body=await request.json(); const name=String(body.name||"").trim(); const email=String(body.email||"").trim().toLowerCase(); const phone=String(body.phone||"").trim(); const preferredTime=String(body.preferredTime||"").trim(); const reason=String(body.reason||"").trim(); const message=String(body.message||"").trim();
  if(!name||!email||!phone||!preferredTime) return NextResponse.json({error:"Name, email, phone and preferred time are required."},{status:400});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:"Please enter a valid email address."},{status:400});
  const result=await db.query(`INSERT INTO call_requests (name,email,phone,preferred_time,reason,message) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,[name,email,phone,preferredTime,reason,message]);
  const gmailUser=process.env.GMAIL_USER; const gmailPass=process.env.GMAIL_APP_PASSWORD;
  if(gmailUser&&gmailPass){const transporter=nodemailer.createTransport({service:"gmail",auth:{user:gmailUser,pass:gmailPass}}); await transporter.sendMail({from:`"Portfolio Call Request" <${process.env.CONTACT_FROM_EMAIL||gmailUser}>`,to:process.env.ADMIN_EMAIL||gmailUser,replyTo:email,subject:`New call request from ${name}`,html:`<p><b>${name}</b> requested a call.</p><p>Email: ${email}<br/>Phone: ${phone}<br/>Preferred time: ${preferredTime}</p><p>${message||"No additional message."}</p>`});}
  return NextResponse.json({success:true,id:result.rows[0].id,message:"Call request submitted successfully."});
  }catch(error){console.error(error);return NextResponse.json({error:"Unable to submit call request."},{status:500});}
}
