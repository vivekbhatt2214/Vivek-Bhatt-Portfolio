import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // =========================================
    // CHECK ENVIRONMENT VARIABLES
    // =========================================

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || gmailUser;

    if (!gmailUser || !gmailAppPassword) {
      console.error("Gmail SMTP credentials are missing.");

      return NextResponse.json(
        {
          error: "Email service is not configured.",
          details:
            "GMAIL_USER or GMAIL_APP_PASSWORD is missing.",
        },
        { status: 500 }
      );
    }

    // =========================================
    // CREATE GMAIL TRANSPORTER
    // =========================================

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // =========================================
    // READ REQUEST
    // =========================================

    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const reason = String(body.reason || "").trim();
    const message = String(body.message || "").trim();

    // =========================================
    // VALIDATION
    // =========================================

    if (!name || !email || !reason || !message) {
      return NextResponse.json(
        {
          error:
            "Name, email, reason and message are required.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // EMAIL VALIDATION
    // =========================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // =========================================
    // GENERATE OTP
    // =========================================

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // =========================================
    // SAVE CONTACT MESSAGE
    // =========================================

    const recordResult = await db.query(
      `
        INSERT INTO contactmessage
        (
          name,
          email,
          reason,
          message,
          "verificationCode",
          verified,
          "lastSentAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
      [
        name,
        email,
        reason,
        message,
        otp,
        false,
        new Date(),
      ]
    );

    const record = recordResult.rows[0];

    // =========================================
    // SEND OTP USING GMAIL SMTP
    // =========================================

    try {
      const mailResult = await transporter.sendMail({
        from: `"Vivek Bhatt Portfolio" <${fromEmail}>`,
        to: email,
        subject:
          "Your Portfolio Email Verification Code",

        html: `
          <!DOCTYPE html>
          <html>
            <body
              style="
                margin:0;
                padding:0;
                background:#050816;
                font-family:Arial,Helvetica,sans-serif;
              "
            >
              <div
                style="
                  max-width:600px;
                  margin:40px auto;
                  padding:30px;
                "
              >

                <div
                  style="
                    background:#0f172a;
                    border:1px solid #1e293b;
                    border-radius:20px;
                    padding:35px;
                    color:#ffffff;
                  "
                >

                  <div
                    style="
                      font-size:12px;
                      font-weight:bold;
                      letter-spacing:2px;
                      color:#00e5ff;
                      margin-bottom:15px;
                    "
                  >
                    PORTFOLIO CONTACT
                  </div>

                  <h2
                    style="
                      margin:0 0 15px;
                      font-size:28px;
                      color:#ffffff;
                    "
                  >
                    Verify your email
                  </h2>

                  <p
                    style="
                      color:#94a3b8;
                      font-size:15px;
                      line-height:1.7;
                    "
                  >
                    Hello ${name},
                  </p>

                  <p
                    style="
                      color:#94a3b8;
                      font-size:15px;
                      line-height:1.7;
                    "
                  >
                    Thank you for contacting
                    <strong style="color:#ffffff;">
                      Vivek Bhatt
                    </strong>.
                    Use the verification code below
                    to confirm your email address.
                  </p>

                  <div
                    style="
                      margin:30px 0;
                      padding:22px;
                      text-align:center;
                      background:#111827;
                      border:1px solid #263449;
                      border-radius:14px;
                    "
                  >

                    <div
                      style="
                        color:#64748b;
                        font-size:11px;
                        letter-spacing:2px;
                        margin-bottom:10px;
                      "
                    >
                      VERIFICATION CODE
                    </div>

                    <div
                      style="
                        color:#00e5ff;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:10px;
                      "
                    >
                      ${otp}
                    </div>

                  </div>

                  <p
                    style="
                      color:#64748b;
                      font-size:13px;
                      line-height:1.6;
                    "
                  >
                    This verification code was generated
                    for your portfolio contact request.
                    If you did not submit this message,
                    you can safely ignore this email.
                  </p>

                  <div
                    style="
                      margin-top:30px;
                      padding-top:20px;
                      border-top:1px solid #1e293b;
                      color:#64748b;
                      font-size:13px;
                    "
                  >
                    Regards,<br/>

                    <strong style="color:#ffffff;">
                      Vivek Bhatt
                    </strong>

                  </div>

                </div>

              </div>
            </body>
          </html>
        `,
      });

      console.log(
        "OTP EMAIL SENT SUCCESSFULLY:",
        mailResult.messageId
      );

    } catch (emailError) {

      console.error(
        "================ GMAIL ERROR ================"
      );

      console.error(emailError);

      console.error(
        "============================================="
      );

      // Remove database record if email failed
      try {
        await db.query(
          `
            DELETE FROM contactmessage
            WHERE id = $1
          `,
          [record.id]
        );
      } catch (deleteError) {
        console.error(
          "Failed to delete unsent contact record:",
          deleteError
        );
      }

      return NextResponse.json(
        {
          error: "Email could not be sent.",
          details:
            emailError instanceof Error
              ? emailError.message
              : "Gmail rejected the email.",
        },
        { status: 500 }
      );
    }

    // =========================================
    // SUCCESS
    // =========================================

    return NextResponse.json({
      success: true,
      message:
        "Verification code sent successfully.",
      id: record.id,
    });

  } catch (error) {

    console.error(
      "================ SEND OTP ERROR ================"
    );

    console.error(error);

    console.error(
      "================================================="
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending the verification email.",

        details:
          error instanceof Error
            ? error.message
            : "Unknown server error.",
      },
      { status: 500 }
    );
  }
}