import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "node:crypto";
import { ensurePortfolioSchema } from "@/lib/schema";

export async function POST(req: Request) {
  try {
    await ensurePortfolioSchema();
    // =========================================
    // READ REQUEST
    // =========================================

    const body = await req.json();

    const id = String(body.id || "").trim();
    const otp = String(
      body.otp || body.code || ""
    ).trim();

    // =========================================
    // VALIDATION
    // =========================================

    if (!id || !otp) {
      return NextResponse.json(
        {
          error: "Verification ID and OTP are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          error: "Please enter a valid 6-digit OTP.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // FIND CONTACT MESSAGE
    // =========================================

    const result = await db.query(
      `
        SELECT
          id,
          "verificationCode",
          verified
        FROM contactmessage
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    // =========================================
    // CONTACT NOT FOUND
    // =========================================

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Verification request not found. Please submit the contact form again.",
        },
        { status: 404 }
      );
    }

    const record = result.rows[0];

    // =========================================
    // ALREADY VERIFIED
    // =========================================

    if (record.verified === true) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: "Email is already verified.",
      });
    }

    // =========================================
    // CHECK OTP
    // =========================================

    if (
      String(record.verificationCode) !== otp
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid verification code. Please check the OTP and try again.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // MARK EMAIL AS VERIFIED
    // =========================================

    await db.query(
      `
        UPDATE contactmessage
        SET
          verified = TRUE,
          "verificationCode" = NULL
        WHERE id = $1
      `,
      [id]
    );

    await db.query(`INSERT INTO analytics_events (id,event_type,session_id,page_path,metadata) VALUES ($1,$2,$3,$4,$5::jsonb)`,[crypto.randomUUID(),"verified_contact",`contact-${id}`,"/portfolio#contact",JSON.stringify({contactId:id})]);

    // =========================================
    // SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,
      verified: true,
      message:
        "Email verified successfully.",
    });
  } catch (error) {
    console.error(
      "================ VERIFY OTP ERROR ================"
    );

    console.error(error);

    console.error(
      "==================================================="
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while verifying the OTP.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown server error.",
      },
      { status: 500 }
    );
  }
}