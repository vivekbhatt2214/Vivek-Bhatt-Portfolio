"use client";

import Link from "next/link";
import VisitorTracker from "@/components/AnalyticsTracker";

export default function WelcomePage() {
  return (
    <>
      <VisitorTracker />
      <main className="entrance-page">
      {/* =========================
          BACKGROUND
      ========================= */}

      <div className="entrance-noise" />
      <div className="entrance-grid" />

      <div className="entrance-orb orb-blue" />
      <div className="entrance-orb orb-purple" />

      {/* =========================
          HEADER
      ========================= */}

      <header className="entrance-header">
        <Link href="/" className="entrance-brand-wrap">
          <div className="entrance-logo">
            <span>VB</span>
          </div>

          <div className="entrance-brand">
            <strong>Vivek Bhatt</strong>

            <small>
              DATA ANALYST • DEVELOPER
            </small>
          </div>
        </Link>

        <div className="entrance-status">
          <span className="status-dot" />
          AVAILABLE FOR OPPORTUNITIES
        </div>
      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section className="entrance-main">
        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="entrance-copy">
          <span className="entrance-number">
            PORTFOLIO EXPERIENCE
          </span>

          <p className="entrance-kicker">
            WELCOME TO MY DIGITAL SPACE
          </p>

          <h1 className="entrance-title">
            Hello,
            <br />
            I&apos;m{" "}
            <span className="entrance-name">
              Vivek.
            </span>
          </h1>

          <div className="entrance-line" />

          <p className="entrance-description">
            Welcome to my professional portfolio — a
            space where data, technology and business
            thinking come together to create meaningful
            digital experiences.
          </p>

          <div className="entrance-action">
            <Link
              href="/portfolio"
              className="enter-button"
            >
              <span className="enter-button-text">
                CLICK TO EXPLORE MY PORTFOLIO
              </span>

              <span className="enter-button-arrow">
                ↗
              </span>
            </Link>

            <span className="enter-hint">
              Enter the experience
            </span>
          </div>
        </div>

        {/* =========================
            RIGHT SIDE VISUAL
        ========================= */}

        <div className="entrance-art">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-ring ring-three" />

          <div className="art-center">
            <div className="art-vb">
              VB
            </div>

            <div className="art-center-line" />

            <span>DATA</span>

            <strong>
              INTELLIGENCE
            </strong>
          </div>

          {/* TOP LABEL */}

          <div className="art-label label-top">
            <span className="label-symbol">
              ◇
            </span>

            <div>
              <small>
                SPECIALIZATION
              </small>

              <strong>
                DATA ANALYTICS
              </strong>
            </div>
          </div>

          {/* RIGHT LABEL */}

          <div className="art-label label-right">
            <span className="label-symbol">
              +
            </span>

            <div>
              <small>
                TOOLKIT
              </small>

              <strong>
                SQL • POWER BI
              </strong>
            </div>
          </div>

          {/* BOTTOM LABEL */}

          <div className="art-label label-bottom">
            <span className="label-symbol">
              ↗
            </span>

            <div>
              <small>
                FOCUS
              </small>

              <strong>
                BUSINESS GROWTH
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="entrance-footer">
        <span>
          © 2026 Vivek Bhatt
        </span>

        <div className="footer-center">
          <span className="footer-dot" />
          PORTFOLIO EXPERIENCE
        </div>

        <span>
          ENTER TO EXPLORE ↗
        </span>
      </footer>
    </main>
    </>
  );
}