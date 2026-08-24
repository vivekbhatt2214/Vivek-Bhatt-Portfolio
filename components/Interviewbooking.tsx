"use client";

import React, { useMemo, useState } from "react";

type TimeSlot = {
  id: string;
  start: string;
  end: string;
};

const TIME_SLOTS: TimeSlot[] = [
  { id: "09:00", start: "9:00 AM", end: "9:15 AM" },
  { id: "09:15", start: "9:15 AM", end: "9:30 AM" },
  { id: "09:30", start: "9:30 AM", end: "9:45 AM" },
  { id: "09:45", start: "9:45 AM", end: "10:00 AM" },
  { id: "10:00", start: "10:00 AM", end: "10:15 AM" },
  { id: "10:15", start: "10:15 AM", end: "10:30 AM" },
  { id: "10:30", start: "10:30 AM", end: "10:45 AM" },
  { id: "10:45", start: "10:45 AM", end: "11:00 AM" },
  { id: "11:00", start: "11:00 AM", end: "11:15 AM" },
  { id: "11:15", start: "11:15 AM", end: "11:30 AM" },
  { id: "11:30", start: "11:30 AM", end: "11:45 AM" },
  { id: "11:45", start: "11:45 AM", end: "12:00 PM" },

  { id: "14:00", start: "2:00 PM", end: "2:15 PM" },
  { id: "14:15", start: "2:15 PM", end: "2:30 PM" },
  { id: "14:30", start: "2:30 PM", end: "2:45 PM" },
  { id: "14:45", start: "2:45 PM", end: "3:00 PM" },
  { id: "15:00", start: "3:00 PM", end: "3:15 PM" },
  { id: "15:15", start: "3:15 PM", end: "3:30 PM" },
  { id: "15:30", start: "3:30 PM", end: "3:45 PM" },
  { id: "15:45", start: "3:45 PM", end: "4:00 PM" },

  { id: "16:00", start: "4:00 PM", end: "4:15 PM" },
  { id: "16:15", start: "4:15 PM", end: "4:30 PM" },
  { id: "16:30", start: "4:30 PM", end: "4:45 PM" },
  { id: "16:45", start: "4:45 PM", end: "5:00 PM" },
];

const INTERVIEW_TYPES = [
  "Job Interview",
  "Data Analyst Discussion",
  "Internship Discussion",
  "Freelance / Collaboration",
  "General Meeting",
];

export default function InterviewBooking() {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [interviewType, setInterviewType] = useState(
    "Job Interview"
  );
  const [meetingLink, setMeetingLink] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* -----------------------------------------
     CALENDAR
  ----------------------------------------- */

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    const current = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (newMonth >= current) {
      setCurrentMonth(newMonth);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPast = (date: Date) => {
    const checkDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return checkDate < currentDate;
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;

    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectDate = (date: Date) => {
    if (isPast(date)) return;

    setSelectedDate(date);
    setSelectedSlot(null);
    setSuccess("");
    setError("");
  };

  /* -----------------------------------------
     BOOKING
  ----------------------------------------- */

  const handleBooking = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedDate) {
      setError("Please select an interview date.");
      return;
    }

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/interview-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          interviewType,
          meetingLink: meetingLink.trim(),
          message: message.trim(),

          date: selectedDate.toISOString(),

          startTime: selectedSlot.start,
          endTime: selectedSlot.end,

          slotId: selectedSlot.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to book the interview."
        );
      }

      setSuccess(
        "Your interview has been booked successfully. A confirmation email will be sent shortly."
      );

      setSelectedDate(null);
      setSelectedSlot(null);

      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setInterviewType("Job Interview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------
     FORMATTING
  ----------------------------------------- */

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Select a date";

  /* -----------------------------------------
     UI
  ----------------------------------------- */

  return (
    <section
      id="booking"
      className="interview-booking-section"
    >
      {/* BACKGROUND EFFECTS */}

      <div className="booking-bg booking-bg-one" />
      <div className="booking-bg booking-bg-two" />
      <div className="booking-grid" />

      <div className="booking-container">

        {/* HEADER */}

        <div className="booking-heading">

          <div className="booking-eyebrow">
            <span className="booking-eyebrow-dot" />
            INTERVIEW BOOKING
          </div>

          <h2>
            Let&apos;s schedule a
            <span> conversation.</span>
          </h2>

          <p>
            Choose a convenient date and time to discuss opportunities,
            projects, internships, analytics, or collaboration.
          </p>

        </div>

        {/* MAIN BOOKING CARD */}

        <div className="booking-main-card">

          {/* LEFT SIDE */}

          <div className="booking-calendar-panel">

            <div className="step-label">
              <span>01</span>
              Choose Interview Date
            </div>

            <div className="calendar-header">

              <button
                type="button"
                onClick={previousMonth}
                className="calendar-arrow"
                aria-label="Previous month"
              >
                ←
              </button>

              <div className="calendar-month">
                {monthName}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="calendar-arrow"
                aria-label="Next month"
              >
                →
              </button>

            </div>

            <div className="calendar-weekdays">
              <span>SU</span>
              <span>MO</span>
              <span>TU</span>
              <span>WE</span>
              <span>TH</span>
              <span>FR</span>
              <span>SA</span>
            </div>

            <div className="calendar-grid">

              {calendarDays.map((date, index) => {

                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-empty"
                    />
                  );
                }

                const disabled = isPast(date);
                const selected = isSelected(date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(date)}
                    className={`
                      calendar-day
                      ${disabled ? "disabled" : ""}
                      ${selected ? "selected" : ""}
                      ${isToday(date) ? "today" : ""}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}

            </div>

            <div className="calendar-footer">

              <div>
                <span className="footer-icon">⚡</span>
                15 min slot
              </div>

              <div>
                Working hours: 9 AM – 5 PM
              </div>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="booking-slot-panel">

            <div className="step-label">
              <span>02</span>
              Select Available Time
            </div>

            <div className="selected-date-preview">
              <div className="date-preview-icon">
                📅
              </div>

              <div>
                <small>SELECTED DATE</small>
                <strong>
                  {formattedDate}
                </strong>
              </div>
            </div>

            <div className="slot-grid">

              {TIME_SLOTS.map((slot) => {

                const selected =
                  selectedSlot?.id === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!selectedDate}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSuccess("");
                      setError("");
                    }}
                    className={`
                      interview-slot
                      ${selected ? "selected" : ""}
                      ${!selectedDate ? "slot-disabled" : ""}
                    `}
                  >
                    <span>
                      {slot.start}
                    </span>

                    <small>
                      {slot.end}
                    </small>
                  </button>
                );
              })}

            </div>

            {!selectedDate && (
              <div className="slot-info-message">
                Select a date first to view available time slots.
              </div>
            )}

          </div>

        </div>

        {/* DETAILS */}

        <form
          className="booking-details-card"
          onSubmit={handleBooking}
        >

          <div className="step-label">
            <span>03</span>
            Your Information
          </div>

          <div className="booking-selected-summary">

            <div className="summary-item">
              <small>DATE</small>
              <strong>
                {selectedDate
                  ? selectedDate.toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )
                  : "Not selected"}
              </strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-item">
              <small>TIME</small>
              <strong>
                {selectedSlot
                  ? `${selectedSlot.start} – ${selectedSlot.end}`
                  : "Not selected"}
              </strong>
            </div>

          </div>

          <div className="booking-form-grid">

            <div className="booking-field">

              <label htmlFor="booking-name">
                Your Name
              </label>

              <input
                id="booking-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>

            <div className="booking-field">

              <label htmlFor="booking-email">
                Email Address
              </label>

              <input
                id="booking-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            <div className="booking-field">

              <label htmlFor="booking-company">
                Company / Organization
                <span>Optional</span>
              </label>

              <input
                id="booking-company"
                type="text"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

            </div>

            <div className="booking-field">

              <label htmlFor="booking-type">
                Meeting Type
              </label>

              <select
                id="booking-type"
                value={interviewType}
                onChange={(e) =>
                  setInterviewType(e.target.value)
                }
              >
                {INTERVIEW_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                ))}
              </select>

            </div>

            <div className="booking-field full-width">

              <label htmlFor="booking-meeting-link">
                Meeting Link
                <span>Optional</span>
              </label>

              <input
                id="booking-meeting-link"
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />

            </div>

            <div className="booking-field full-width">

              <label htmlFor="booking-message">
                Message
                <span>Optional</span>
              </label>

              <textarea
                id="booking-message"
                rows={4}
                placeholder="Tell me briefly what you'd like to discuss..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="booking-alert booking-error">

              <div className="alert-icon">
                !
              </div>

              <div>
                <strong>Unable to continue</strong>

                <p>{error}</p>
              </div>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="booking-alert booking-success">

              <div className="alert-icon">
                ✓
              </div>

              <div>
                <strong>Interview booked successfully</strong>

                <p>{success}</p>
              </div>

            </div>
          )}

          {/* BUTTON */}

          <div className="booking-submit-area">

            <div className="booking-security">
              <span>🔒</span>

              <div>
                <strong>Your information is secure</strong>
                <small>
                  Your details are only used for scheduling this meeting.
                </small>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="booking-submit"
            >
              {loading ? (
                <>
                  <span className="booking-spinner" />
                  Booking...
                </>
              ) : (
                <>
                  Confirm Interview
                  <span>→</span>
                </>
              )}
            </button>

          </div>

        </form>

        {/* BOTTOM INFO */}

        <div className="booking-bottom-info">

          <div>
            <span>✦</span>
            Professional meetings
          </div>

          <div>
            <span>✦</span>
            15-minute sessions
          </div>

          <div>
            <span>✦</span>
            Email confirmation
          </div>

          <div>
            <span>✦</span>
            Flexible scheduling
          </div>

        </div>

      </div>

      {/* COMPONENT STYLES */}

      <style jsx>{`

        /* =========================================
           MAIN SECTION
        ========================================= */

        .interview-booking-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;

          padding: 130px 24px;

          background:
            radial-gradient(
              circle at 10% 10%,
              rgba(0, 229, 255, 0.07),
              transparent 28%
            ),
            radial-gradient(
              circle at 90% 15%,
              rgba(139, 92, 246, 0.08),
              transparent 30%
            ),
            #050816;

          color: #ffffff;
        }

        /* =========================================
           BACKGROUND
        ========================================= */

        .booking-bg {
          position: absolute;
          pointer-events: none;
          z-index: -2;
        }

        .booking-bg-one {
          width: 700px;
          height: 700px;

          top: -350px;
          left: -300px;

          background:
            radial-gradient(
              circle,
              rgba(0, 229, 255, 0.12),
              transparent 68%
            );

          filter: blur(30px);
        }

        .booking-bg-two {
          width: 700px;
          height: 700px;

          right: -350px;
          bottom: -300px;

          background:
            radial-gradient(
              circle,
              rgba(139, 92, 246, 0.12),
              transparent 68%
            );

          filter: blur(35px);
        }

        .booking-grid {
          position: absolute;
          inset: 0;

          z-index: -3;

          opacity: 0.3;

          background-image:
            linear-gradient(
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.025) 1px,
              transparent 1px
            );

          background-size: 70px 70px;

          mask-image:
            linear-gradient(
              to bottom,
              transparent,
              black 20%,
              black 80%,
              transparent
            );
        }

        /* =========================================
           CONTAINER
        ========================================= */

        .booking-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        /* =========================================
           HEADER
        ========================================= */

        .booking-heading {
          max-width: 720px;
          margin-bottom: 55px;
        }

        .booking-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 18px;

          color: #00e5ff;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.2em;
        }

        .booking-eyebrow-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #00e5ff;

          box-shadow:
            0 0 14px rgba(0,229,255,0.8);
        }

        .booking-heading h2 {
          margin: 0;

          font-size: clamp(
            40px,
            5vw,
            70px
          );

          line-height: 1.03;

          letter-spacing: -0.045em;

          font-weight: 800;
        }

        .booking-heading h2 span {
          display: block;

          background:
            linear-gradient(
              90deg,
              #00e5ff,
              #8b5cf6
            );

          -webkit-background-clip: text;
          background-clip: text;

          color: transparent;
        }

        .booking-heading p {
          max-width: 650px;

          margin: 24px 0 0;

          color: #8d97ad;

          font-size: 16px;
          line-height: 1.8;
        }

        /* =========================================
           MAIN CARD
        ========================================= */

        .booking-main-card {
          display: grid;

          grid-template-columns:
            minmax(0, 1.05fr)
            minmax(0, 0.95fr);

          border: 1px solid
            rgba(255,255,255,0.09);

          border-radius: 28px;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.065),
              rgba(255,255,255,0.018)
            );

          backdrop-filter: blur(24px);

          box-shadow:
            0 35px 100px
            rgba(0,0,0,0.35);
        }

        .booking-calendar-panel,
        .booking-slot-panel {
          padding: 34px;
        }

        .booking-calendar-panel {
          border-right: 1px solid
            rgba(255,255,255,0.07);
        }

        /* =========================================
           STEP LABEL
        ========================================= */

        .step-label {
          display: flex;
          align-items: center;
          gap: 12px;

          margin-bottom: 25px;

          font-size: 16px;
          font-weight: 750;

          color: #ffffff;
        }

        .step-label span {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          width: 34px;
          height: 34px;

          border-radius: 10px;

          color: #00e5ff;

          background:
            rgba(0,229,255,0.08);

          border: 1px solid
            rgba(0,229,255,0.15);

          font-size: 11px;
          font-weight: 800;
        }

        /* =========================================
           CALENDAR
        ========================================= */

        .calendar-header {
          display: grid;

          grid-template-columns:
            42px 1fr 42px;

          align-items: center;

          margin-bottom: 28px;
        }

        .calendar-month {
          text-align: center;

          font-size: 16px;
          font-weight: 750;
        }

        .calendar-arrow {
          width: 40px;
          height: 40px;

          border: 1px solid
            rgba(255,255,255,0.10);

          border-radius: 12px;

          color: #ffffff;

          background:
            rgba(255,255,255,0.035);

          cursor: pointer;

          transition:
            0.25s ease;
        }

        .calendar-arrow:hover {
          border-color:
            rgba(0,229,255,0.45);

          color: #00e5ff;

          background:
            rgba(0,229,255,0.07);
        }

        .calendar-weekdays {
          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          margin-bottom: 12px;
        }

        .calendar-weekdays span {
          text-align: center;

          color: #5e6b82;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.1em;
        }

        .calendar-grid {
          display: grid;

          grid-template-columns:
            repeat(7, 1fr);

          gap: 7px;
        }

        .calendar-empty {
          aspect-ratio: 1;
        }

        .calendar-day {
          width: 100%;
          aspect-ratio: 1;

          border: 1px solid transparent;

          border-radius: 12px;

          background: transparent;

          color: #d9deea;

          font-size: 13px;
          font-weight: 650;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .calendar-day:hover:not(:disabled) {
          transform: translateY(-2px);

          background:
            rgba(0,229,255,0.07);

          border-color:
            rgba(0,229,255,0.25);

          color: #00e5ff;
        }

        .calendar-day.today {
          color: #00e5ff;

          border-color:
            rgba(0,229,255,0.25);
        }

        .calendar-day.selected {
          color: #031016;

          background:
            linear-gradient(
              135deg,
              #00e5ff,
              #6ee7ff
            );

          border-color: #00e5ff;

          box-shadow:
            0 8px 25px
            rgba(0,229,255,0.20);
        }

        .calendar-day.disabled {
          color: #343c4c;

          cursor: not-allowed;

          opacity: 0.5;
        }

        .calendar-footer {
          display: flex;

          justify-content: space-between;

          gap: 15px;

          margin-top: 28px;
          padding-top: 18px;

          border-top: 1px solid
            rgba(255,255,255,0.07);

          color: #68758c;

          font-size: 11px;
        }

        .calendar-footer div {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .footer-icon {
          color: #00e5ff;
        }

        /* =========================================
           TIME SLOTS
        ========================================= */

        .selected-date-preview {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 14px;

          margin-bottom: 22px;

          border-radius: 15px;

          background:
            rgba(0,229,255,0.045);

          border: 1px solid
            rgba(0,229,255,0.10);
        }

        .date-preview-icon {
          width: 42px;
          height: 42px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          background:
            rgba(0,229,255,0.08);

          font-size: 17px;
        }

        .selected-date-preview small {
          display: block;

          margin-bottom: 3px;

          color: #68758c;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.15em;
        }

        .selected-date-preview strong {
          display: block;

          color: #ffffff;

          font-size: 12px;
        }

        .slot-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 10px;

          max-height: 430px;

          overflow-y: auto;

          padding-right: 4px;
        }

        .slot-grid::-webkit-scrollbar {
          width: 5px;
        }

        .slot-grid::-webkit-scrollbar-track {
          background:
            rgba(255,255,255,0.03);

          border-radius: 20px;
        }

        .slot-grid::-webkit-scrollbar-thumb {
          background:
            rgba(255,255,255,0.12);

          border-radius: 20px;
        }

        .interview-slot {
          min-height: 62px;

          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: center;

          gap: 4px;

          border: 1px solid
            rgba(255,255,255,0.09);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.025);

          color: #ffffff;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .interview-slot:hover:not(:disabled) {
          transform: translateY(-2px);

          border-color:
            rgba(0,229,255,0.4);

          background:
            rgba(0,229,255,0.07);
        }

        .interview-slot.selected {
          border-color: #00e5ff;

          background:
            linear-gradient(
              135deg,
              rgba(0,229,255,0.14),
              rgba(139,92,246,0.12)
            );

          box-shadow:
            0 0 25px
            rgba(0,229,255,0.08);
        }

        .interview-slot span {
          font-size: 13px;
          font-weight: 750;
        }

        .interview-slot small {
          color: #68758c;

          font-size: 9px;
        }

        .slot-disabled {
          opacity: 0.3;

          cursor: not-allowed;
        }

        .slot-info-message {
          padding: 18px;

          margin-top: 14px;

          text-align: center;

          border-radius: 13px;

          color: #66738a;

          background:
            rgba(255,255,255,0.025);

          border: 1px dashed
            rgba(255,255,255,0.08);

          font-size: 11px;
        }

        /* =========================================
           DETAILS CARD
        ========================================= */

        .booking-details-card {
          margin-top: 24px;

          padding: 34px;

          border: 1px solid
            rgba(255,255,255,0.09);

          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,0.06),
              rgba(255,255,255,0.018)
            );

          backdrop-filter: blur(24px);

          box-shadow:
            0 30px 90px
            rgba(0,0,0,0.25);
        }

        .booking-selected-summary {
          display: flex;

          align-items: center;

          gap: 30px;

          padding: 17px 20px;

          margin-bottom: 28px;

          border-radius: 15px;

          background:
            rgba(0,229,255,0.04);

          border: 1px solid
            rgba(0,229,255,0.09);
        }

        .summary-item {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }

        .summary-item small {
          color: #647189;

          font-size: 8px;
          font-weight: 800;

          letter-spacing: 0.15em;
        }

        .summary-item strong {
          color: #ffffff;

          font-size: 12px;
        }

        .summary-divider {
          width: 1px;
          height: 32px;

          background:
            rgba(255,255,255,0.09);
        }

        /* =========================================
           FORM
        ========================================= */

        .booking-form-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 20px;
        }

        .booking-field {
          display: flex;

          flex-direction: column;

          gap: 9px;
        }

        .booking-field.full-width {
          grid-column: 1 / -1;
        }

        .booking-field label {
          display: flex;

          justify-content: space-between;

          color: #a5aec0;

          font-size: 11px;
          font-weight: 650;
        }

        .booking-field label span {
          color: #58647a;

          font-size: 9px;

          font-weight: 500;
        }

        .booking-field input,
        .booking-field select,
        .booking-field textarea {
          width: 100%;

          box-sizing: border-box;

          border: 1px solid
            rgba(255,255,255,0.09);

          border-radius: 13px;

          outline: none;

          color: #ffffff;

          background:
            rgba(255,255,255,0.035);

          font-family: inherit;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .booking-field input,
        .booking-field select {
          height: 50px;

          padding: 0 15px;

          font-size: 12px;
        }

        .booking-field textarea {
          min-height: 115px;

          padding: 14px 15px;

          resize: vertical;

          font-size: 12px;
          line-height: 1.6;
        }

        .booking-field input::placeholder,
        .booking-field textarea::placeholder {
          color: #4f5b70;
        }

        .booking-field select {
          cursor: pointer;
        }

        .booking-field select option {
          color: #ffffff;

          background: #0a0f20;
        }

        .booking-field input:focus,
        .booking-field select:focus,
        .booking-field textarea:focus {
          border-color:
            rgba(0,229,255,0.55);

          background:
            rgba(0,229,255,0.035);

          box-shadow:
            0 0 0 3px
            rgba(0,229,255,0.06);
        }

        /* =========================================
           ALERTS
        ========================================= */

        .booking-alert {
          display: flex;

          gap: 13px;

          margin-top: 22px;

          padding: 16px;

          border-radius: 14px;
        }

        .booking-error {
          border: 1px solid
            rgba(248,113,113,0.25);

          background:
            rgba(248,113,113,0.07);

          color: #fca5a5;
        }

        .booking-success {
          border: 1px solid
            rgba(34,197,94,0.25);

          background:
            rgba(34,197,94,0.07);

          color: #86efac;
        }

        .alert-icon {
          flex-shrink: 0;

          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.06);

          font-weight: 800;
        }

        .booking-alert strong {
          display: block;

          margin-bottom: 4px;

          color: #ffffff;

          font-size: 12px;
        }

        .booking-alert p {
          margin: 0;

          font-size: 11px;

          line-height: 1.6;
        }

        /* =========================================
           SUBMIT
        ========================================= */

        .booking-submit-area {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 25px;

          margin-top: 30px;

          padding-top: 25px;

          border-top: 1px solid
            rgba(255,255,255,0.07);
        }

        .booking-security {
          display: flex;

          align-items: center;

          gap: 11px;
        }

        .booking-security > span {
          width: 36px;
          height: 36px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            rgba(34,197,94,0.07);

          font-size: 14px;
        }

        .booking-security strong {
          display: block;

          margin-bottom: 3px;

          color: #aab3c4;

          font-size: 10px;
        }

        .booking-security small {
          display: block;

          color: #536078;

          font-size: 9px;
        }

        .booking-submit {
          min-width: 230px;

          height: 52px;

          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 14px;

          border: none;

          border-radius: 13px;

          color: #031016;

          background:
            linear-gradient(
              135deg,
              #00e5ff,
              #64eaff
            );

          font-family: inherit;

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 12px 35px
            rgba(0,229,255,0.14);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            opacity 0.25s ease;
        }

        .booking-submit:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 18px 45px
            rgba(0,229,255,0.24);
        }

        .booking-submit:disabled {
          opacity: 0.6;

          cursor: not-allowed;
        }

        .booking-submit > span:last-child {
          font-size: 17px;
        }

        .booking-spinner {
          width: 15px;
          height: 15px;

          border: 2px solid
            rgba(3,16,22,0.25);

          border-top-color:
            #031016;

          border-radius: 50%;

          animation:
            booking-spin 0.7s linear infinite;
        }

        @keyframes booking-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================================
           BOTTOM FEATURES
        ========================================= */

        .booking-bottom-info {
          display: flex;

          align-items: center;
          justify-content: center;

          flex-wrap: wrap;

          gap: 30px;

          margin-top: 30px;

          color: #56627a;

          font-size: 10px;
        }

        .booking-bottom-info div {
          display: flex;

          align-items: center;

          gap: 7px;
        }

        .booking-bottom-info span {
          color: #00e5ff;
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 900px) {

          .booking-main-card {
            grid-template-columns: 1fr;
          }

          .booking-calendar-panel {
            border-right: none;

            border-bottom: 1px solid
              rgba(255,255,255,0.07);
          }

        }

        @media (max-width: 650px) {

          .interview-booking-section {
            padding:
              90px 16px;
          }

          .booking-heading {
            margin-bottom: 35px;
          }

          .booking-heading h2 {
            font-size: 42px;
          }

          .booking-calendar-panel,
          .booking-slot-panel,
          .booking-details-card {
            padding: 22px;
          }

          .calendar-grid {
            gap: 4px;
          }

          .calendar-day {
            border-radius: 9px;

            font-size: 11px;
          }

          .booking-form-grid {
            grid-template-columns: 1fr;
          }

          .booking-field.full-width {
            grid-column: auto;
          }

          .booking-selected-summary {
            gap: 15px;

            justify-content: space-between;
          }

          .booking-submit-area {
            flex-direction: column;

            align-items: stretch;
          }

          .booking-submit {
            width: 100%;
          }

          .booking-security {
            align-items: flex-start;
          }

          .calendar-footer {
            flex-direction: column;
          }

          .booking-bottom-info {
            gap: 15px;
          }

        }

      `}</style>
    </section>
  );
}