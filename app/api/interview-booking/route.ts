import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";

// =====================================================
// GMAIL SMTP CONFIGURATION
// =====================================================

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const transporter =
  gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      })
    : null;

// =====================================================
// POST - CREATE INTERVIEW BOOKING
// =====================================================

export async function POST(req: Request) {
  const client = await db.connect();

  try {
    // ===================================================
    // READ REQUEST
    // ===================================================

    const body = await req.json();

    const {
      name,
      email,
      company,
      interviewType,
      meetingLink,
      message,
      date,
      startTime,
      endTime,
      slotId,
    } = body;

    // ===================================================
    // VALIDATION
    // ===================================================

    if (
      !name ||
      !email ||
      !date ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email, date and time slot are required.",
        },
        { status: 400 }
      );
    }

    // ===================================================
    // EMAIL VALIDATION
    // ===================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // ===================================================
    // CHECK GMAIL CONFIGURATION
    // ===================================================

    if (!gmailUser) {
      console.error("GMAIL_USER is missing.");

      return NextResponse.json(
        {
          error:
            "Email service is not configured.",
          details:
            "GMAIL_USER is missing from the .env file.",
        },
        { status: 500 }
      );
    }

    if (!gmailAppPassword) {
      console.error(
        "GMAIL_APP_PASSWORD is missing."
      );

      return NextResponse.json(
        {
          error:
            "Email service is not configured.",
          details:
            "GMAIL_APP_PASSWORD is missing from the .env file.",
        },
        { status: 500 }
      );
    }

    if (!transporter) {
      return NextResponse.json(
        {
          error:
            "Email service is not configured correctly.",
        },
        { status: 500 }
      );
    }

    // ===================================================
    // PREPARE DATA
    // ===================================================

    const bookingDate = new Date(date);

    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          error: "Invalid interview date.",
        },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();

    const cleanEmail = String(email)
      .trim()
      .toLowerCase();

    const cleanCompany = company
      ? String(company).trim()
      : null;

    const cleanInterviewType = interviewType
      ? String(interviewType).trim()
      : "Job Interview";

    const cleanMeetingLink = meetingLink
      ? String(meetingLink).trim()
      : null;

    const cleanMessage = message
      ? String(message).trim()
      : null;

    const cleanStartTime =
      String(startTime).trim();

    const cleanEndTime =
      String(endTime).trim();

    // Keep the optional meeting-link field compatible with the existing
    // PostgreSQL interviewbooking table. No Prisma is required.
    await client.query(`
      ALTER TABLE interviewbooking
      ADD COLUMN IF NOT EXISTS "meetingLink" TEXT
    `);

    // ===================================================
    // START DATABASE TRANSACTION
    // ===================================================

    await client.query("BEGIN");

    // ===================================================
    // FIND EXISTING INTERVIEW SLOT
    // ===================================================

    let slotResult = await client.query(
      `
        SELECT
          id,
          date,
          "startTime",
          "endTime",
          "isAvailable"
        FROM interviewslot
        WHERE date = $1
          AND "startTime" = $2
          AND "endTime" = $3
        LIMIT 1
      `,
      [
        bookingDate,
        cleanStartTime,
        cleanEndTime,
      ]
    );

    let actualSlot = slotResult.rows[0];

    // ===================================================
    // CREATE SLOT IF IT DOES NOT EXIST
    // ===================================================

    if (!actualSlot) {
      try {
        const createSlotResult =
          await client.query(
            `
              INSERT INTO interviewslot
              (
                date,
                "startTime",
                "endTime",
                "isAvailable"
              )
              VALUES ($1, $2, $3, TRUE)
              RETURNING
                id,
                date,
                "startTime",
                "endTime",
                "isAvailable"
            `,
            [
              bookingDate,
              cleanStartTime,
              cleanEndTime,
            ]
          );

        actualSlot =
          createSlotResult.rows[0];
      } catch (slotCreateError) {
        console.error(
          "SLOT CREATION ERROR:",
          slotCreateError
        );

        // Another request may have created
        // the same slot.

        slotResult = await client.query(
          `
            SELECT
              id,
              date,
              "startTime",
              "endTime",
              "isAvailable"
            FROM interviewslot
            WHERE date = $1
              AND "startTime" = $2
              AND "endTime" = $3
            LIMIT 1
          `,
          [
            bookingDate,
            cleanStartTime,
            cleanEndTime,
          ]
        );

        actualSlot = slotResult.rows[0];

        if (!actualSlot) {
          await client.query("ROLLBACK");

          return NextResponse.json(
            {
              error:
                "Unable to create the interview slot. Please try again.",
            },
            { status: 500 }
          );
        }
      }
    }

    // ===================================================
    // CHECK WHETHER SLOT IS ALREADY BOOKED
    // ===================================================

    if (!actualSlot.isAvailable) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            "This interview slot has already been booked. Please select another time.",
        },
        { status: 400 }
      );
    }

    // ===================================================
    // CLAIM SLOT
    // ===================================================

    const claimResult = await client.query(
      `
        UPDATE interviewslot
        SET "isAvailable" = FALSE
        WHERE id = $1
          AND "isAvailable" = TRUE
        RETURNING id
      `,
      [actualSlot.id]
    );

    if (claimResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error:
            "This interview slot has already been booked. Please select another time.",
        },
        { status: 400 }
      );
    }

    // ===================================================
    // CREATE INTERVIEW BOOKING
    // ===================================================

    const bookingResult = await client.query(
      `
        INSERT INTO interviewbooking
        (
          name,
          email,
          company,
          "interviewType",
          "meetingLink",
          message,
          date,
          "startTime",
          "endTime",
          status,
          "slotId"
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          'PENDING',
          $10
        )
        RETURNING
          id,
          name,
          email,
          company,
          "interviewType",
          "meetingLink",
          message,
          date,
          "startTime",
          "endTime",
          status,
          "slotId"
      `,
      [
        cleanName,
        cleanEmail,
        cleanCompany,
        cleanInterviewType,
        cleanMeetingLink,
        cleanMessage,
        bookingDate,
        cleanStartTime,
        cleanEndTime,
        actualSlot.id,
      ]
    );

    const booking =
      bookingResult.rows[0];

    // ===================================================
    // COMMIT DATABASE TRANSACTION
    // ===================================================

    await client.query("COMMIT");

    // ===================================================
    // FORMAT DATE
    // ===================================================

    const formattedDate =
      new Date(
        bookingDate
      ).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // ===================================================
    // EMAIL 1:
    // SEND BOOKING DETAILS TO PORTFOLIO OWNER
    // ===================================================

    try {
      await transporter.sendMail({
        from: `"Vivek Bhatt Portfolio" <${gmailUser}>`,

        to:
          process.env.OWNER_EMAIL ||
          gmailUser,

        replyTo: cleanEmail,

        subject:
          `New Interview Booking - ${cleanName}`,

        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>New Interview Booking</title>
</head>

<body style="
margin:0;
padding:0;
background:#050816;
font-family:Arial,Helvetica,sans-serif;
">

<div style="
max-width:650px;
margin:40px auto;
padding:20px;
">

<div style="
background:#0b1020;
border:1px solid #20283b;
border-radius:20px;
overflow:hidden;
">

<!-- HEADER -->

<div style="
padding:30px;
background:linear-gradient(
135deg,
#07131d,
#11102a
);
border-bottom:1px solid #20283b;
">

<div style="
color:#00e5ff;
font-size:12px;
font-weight:bold;
letter-spacing:2px;
margin-bottom:12px;
">
INTERVIEW BOOKING
</div>

<h1 style="
margin:0;
color:#ffffff;
font-size:28px;
">
New Interview Request
</h1>

<p style="
color:#8792a8;
font-size:14px;
line-height:1.6;
">
Someone has requested an interview through your
portfolio website.
</p>

</div>

<!-- CONTENT -->

<div style="padding:30px;">

<!-- APPLICANT -->

<div style="
padding:20px;
margin-bottom:20px;
background:#101728;
border:1px solid #222d43;
border-radius:14px;
">

<h3 style="
margin-top:0;
color:#00e5ff;
font-size:13px;
letter-spacing:1px;
">
APPLICANT DETAILS
</h3>

<p style="color:#ffffff;">
<strong>Name:</strong>
${escapeHtml(cleanName)}
</p>

<p style="color:#ffffff;">
<strong>Email:</strong>
${escapeHtml(cleanEmail)}
</p>

<p style="color:#ffffff;">
<strong>Company:</strong>
${escapeHtml(
  cleanCompany || "Not provided"
)}
</p>

<p style="color:#ffffff;">
<strong>Meeting Type:</strong>
${escapeHtml(cleanInterviewType)}
</p>

</div>

<!-- SCHEDULE -->

<div style="
padding:20px;
margin-bottom:20px;
background:#0d1920;
border:1px solid rgba(0,229,255,0.18);
border-radius:14px;
">

<h3 style="
margin-top:0;
color:#00e5ff;
font-size:13px;
letter-spacing:1px;
">
INTERVIEW SCHEDULE
</h3>

<p style="color:#ffffff;">
<strong>Date:</strong>
${escapeHtml(formattedDate)}
</p>

<p style="color:#ffffff;">
<strong>Time:</strong>
${escapeHtml(cleanStartTime)}
-
${escapeHtml(cleanEndTime)}
</p>

${
  cleanMeetingLink
    ? `
<p style="color:#ffffff;">
<strong>Meeting Link:</strong>
<a href="${escapeHtml(cleanMeetingLink)}" style="color:#00e5ff;">
${escapeHtml(cleanMeetingLink)}
</a>
</p>
`
    : ""
}

</div>

<!-- MESSAGE -->

${
  cleanMessage
    ? `
<div style="
padding:20px;
margin-bottom:20px;
background:#101728;
border:1px solid #222d43;
border-radius:14px;
">

<h3 style="
margin-top:0;
color:#00e5ff;
font-size:13px;
letter-spacing:1px;
">
MESSAGE
</h3>

<p style="
margin:0;
color:#c4cada;
font-size:14px;
line-height:1.7;
">
${escapeHtml(cleanMessage)}
</p>

</div>
`
    : ""
}

<!-- BOOKING ID -->

<div style="
padding:15px;
background:#111827;
border-radius:12px;
color:#77839a;
font-size:11px;
">
Booking ID:
<strong>
${escapeHtml(String(booking.id))}
</strong>
</div>

</div>

<!-- FOOTER -->

<div style="
padding:20px 30px;
border-top:1px solid #20283b;
color:#59657c;
font-size:11px;
text-align:center;
">

Vivek Bhatt Portfolio
<br>
Interview Booking System

</div>

</div>

</div>

</body>
</html>
        `,
      });

      console.log(
        "OWNER EMAIL SENT SUCCESSFULLY"
      );
    } catch (emailError) {
      // Booking is already saved.
      console.error(
        "OWNER EMAIL ERROR:",
        emailError
      );
    }

    // ===================================================
    // EMAIL 2:
    // SEND CONFIRMATION TO APPLICANT
    // ===================================================

    try {
      await transporter.sendMail({
        from: `"Vivek Bhatt Portfolio" <${gmailUser}>`,

        to: cleanEmail,

        replyTo:
          process.env.OWNER_EMAIL ||
          gmailUser,

        subject:
          "Interview Booking Received - Vivek Bhatt",

        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Interview Booking Received</title>
</head>

<body style="
margin:0;
padding:0;
background:#050816;
font-family:Arial,Helvetica,sans-serif;
">

<div style="
max-width:600px;
margin:40px auto;
padding:20px;
">

<div style="
background:#0b1020;
border:1px solid #20283b;
border-radius:20px;
overflow:hidden;
">

<!-- HEADER -->

<div style="
padding:35px;
text-align:center;
background:linear-gradient(
135deg,
#07131d,
#11102a
);
">

<div style="
width:55px;
height:55px;
line-height:55px;
margin:0 auto 18px;
border-radius:50%;
background:#00e5ff;
color:#031016;
font-size:25px;
font-weight:bold;
">
✓
</div>

<h1 style="
margin:0;
color:#ffffff;
font-size:26px;
">
Booking Received
</h1>

<p style="
color:#8994aa;
font-size:14px;
line-height:1.7;
">
Hi ${escapeHtml(cleanName)},
your interview request has been received successfully.
</p>

</div>

<!-- CONTENT -->

<div style="padding:30px;">

<div style="
padding:22px;
background:#101728;
border:1px solid #222d43;
border-radius:15px;
">

<h3 style="
margin-top:0;
color:#00e5ff;
">
Your Interview
</h3>

<p style="color:#ffffff;">
<strong>Date:</strong>
${escapeHtml(formattedDate)}
</p>

<p style="color:#ffffff;">
<strong>Time:</strong>
${escapeHtml(cleanStartTime)}
-
${escapeHtml(cleanEndTime)}
</p>

${
  cleanMeetingLink
    ? `
<p style="color:#ffffff;">
<strong>Meeting Link:</strong>
<a href="${escapeHtml(cleanMeetingLink)}" style="color:#00e5ff;">
${escapeHtml(cleanMeetingLink)}
</a>
</p>
`
    : ""
}

<p style="color:#ffffff;">
<strong>Meeting:</strong>
${escapeHtml(cleanInterviewType)}
</p>

<p style="color:#ffffff;">
<strong>Status:</strong>
<span style="color:#00e5ff;">
Pending
</span>
</p>

</div>

<p style="
margin-top:25px;
color:#8994aa;
font-size:13px;
line-height:1.7;
">

Thank you for reaching out.
Your booking request has been received successfully.

Your request is currently marked as
<strong style="color:#ffffff;">
PENDING
</strong>.

You will receive further communication regarding
the interview.

</p>

</div>

<!-- FOOTER -->

<div style="
padding:20px;
border-top:1px solid #20283b;
text-align:center;
color:#59657c;
font-size:11px;
">

Vivek Bhatt · Data Analyst Portfolio

</div>

</div>

</div>

</body>
</html>
        `,
      });

      console.log(
        "APPLICANT EMAIL SENT SUCCESSFULLY"
      );
    } catch (emailError) {
      // Booking is already successful.
      console.error(
        "APPLICANT EMAIL ERROR:",
        emailError
      );
    }

    // ===================================================
    // SUCCESS RESPONSE
    // ===================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Interview booked successfully.",
        bookingId: booking.id,
      },
      { status: 200 }
    );

  } catch (error) {

    // ===================================================
    // ROLLBACK DATABASE
    // ===================================================

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "ROLLBACK ERROR:",
        rollbackError
      );
    }

    console.error(
      "INTERVIEW BOOKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete the interview booking.",
      },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}

// =====================================================
// HTML ESCAPE FUNCTION
// =====================================================

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}