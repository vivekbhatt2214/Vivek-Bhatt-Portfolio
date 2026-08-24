import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { isAdmin } from "@/lib/admin-auth";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!(await isAdmin())) return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json();
 const jsonResponse=await handleUpload({body,request,token:process.env.BLOB_READ_WRITE_TOKEN,onBeforeGenerateToken:async(pathname)=>({allowedContentTypes:["image/*","application/pdf","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","text/csv","application/zip","application/octet-stream"],addRandomSuffix:true,maximumSizeInBytes:100*1024*1024}),onUploadCompleted:async()=>{}});
 return NextResponse.json(jsonResponse);
}
