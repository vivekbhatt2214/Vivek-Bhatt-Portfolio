"use client";

import Link from "next/link";
import TypingText from "@/components/extras/TypingText";

const roleWords = [
  "Data Analytics",
  "MIS Reporting",
  "Business Intelligence",
  "Power BI Dashboards",
  "SQL & Python",
];

export default function Hero() {
  return (
    <section className="new-hero">

      {/* Background */}
      <div className="new-hero-glow new-hero-glow-one" />
      <div className="new-hero-glow new-hero-glow-two" />
      <div className="new-hero-grid" />

      <div className="new-hero-container">

        {/* LEFT SIDE */}
        <div className="new-hero-content">

          <div className="new-hero-intro">
            <span className="new-hero-status" />
            <span>WELCOME TO MY PORTFOLIO</span>
          </div>

          <div className="new-hero-index">
            DATA ANALYTICS • MIS • BUSINESS INTELLIGENCE
          </div>

          <h1 className="new-hero-title">
            Hello,
            <br />
            I&apos;m{" "}
            <span>Vivek Bhatt.</span>
          </h1>

          <div className="new-hero-role">
            <TypingText words={roleWords} />
          </div>

          <p className="new-hero-description">
            I am Vivek Bhatt, a BCA professional building a career in Data Analytics, MIS Reporting and Business Intelligence through practical projects and structured problem solving.
          </p>

          <p className="new-hero-description secondary">
            I work with Excel, SQL, Power BI and Python to explore
            data, discover useful patterns and present information
            in a simple and meaningful way.
          </p>

          <div className="new-hero-actions">

            <Link
              href="#projects"
              className="new-hero-primary"
            >
              <span>Explore My Work</span>
              <span className="new-hero-arrow">↗</span>
            </Link>

            <Link
              href="#about"
              className="new-hero-secondary"
            >
              About Me
              <span>↓</span>
            </Link>

          </div>

          {/* SMALL STATS */}
          <div className="new-hero-stats">

            <div className="new-hero-stat">
              <strong>8.0</strong>
              <span>CGPA</span>
            </div>

            <div className="new-hero-stat">
              <strong>04+</strong>
              <span>PROJECTS</span>
            </div>

            <div className="new-hero-stat">
              <strong>2026</strong>
              <span>GRADUATION</span>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="new-hero-visual">

          <div className="new-hero-visual-number">
            01
          </div>

          <div className="new-hero-line" />

          <div className="new-hero-profile-card">

            <div className="profile-card-top">

              <span className="profile-card-label">
                CURRENTLY BUILDING
              </span>

              <span className="profile-card-dot">
                ●
              </span>

            </div>

            <h2>
              Turning
              <br />
              learning into
              <br />
              <span>real projects.</span>
            </h2>

            <p>
              Exploring data, creating dashboards and developing
              practical analytical solutions while preparing for
              my professional career.
            </p>

            <div className="profile-card-divider" />

            <div className="profile-card-tools">

              <span>EXCEL</span>
              <span>SQL</span>
              <span>POWER BI</span>
              <span>PYTHON</span>

            </div>

          </div>


          {/* Bottom information */}
          <div className="new-hero-side-info">

            <span className="side-info-number">
              04+
            </span>

            <div>
              <strong>PROJECTS</strong>
              <small>
                Hands-on learning
              </small>
            </div>

          </div>

          <div className="new-hero-side-location">
            INDIA
            <span>•</span>
            2023—26
          </div>

        </div>

      </div>


      {/* BOTTOM */}
      <div className="new-hero-bottom">

        <span>
          SCROLL TO EXPLORE
        </span>

        <div className="new-hero-scroll-line">
          <span />
        </div>

        <span>
          DATA • ANALYSIS • GROWTH
        </span>

      </div>

    </section>
  );
}