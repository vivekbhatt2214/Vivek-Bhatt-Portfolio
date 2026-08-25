"use client";

import Link from "next/link";
import TypingText from "@/components/extras/TypingText";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function Hero() {
  const { profile, siteContent } = useSiteContent();
  const hero = siteContent.hero;
  const displayName = profile.displayName || "Vivek Bhatt";
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
            <span>{hero.eyebrow}</span>
          </div>

          <div className="new-hero-index">
            {hero.index}
          </div>

          <h1 className="new-hero-title">
            Hello,
            <br />
            I&apos;m{" "}
            <span>{displayName}.</span>
          </h1>

          <div className="new-hero-role">
            <TypingText words={hero.roleWords} />
          </div>

          <p className="new-hero-description">{hero.description.replace("Vivek Bhatt", displayName)}</p>

          <p className="new-hero-description secondary">{hero.secondaryDescription}</p>

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

            {hero.stats.map((stat) => (
              <div className="new-hero-stat" key={`${stat.value}-${stat.label}`}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}

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
                {hero.cardLabel}
              </span>

              <span className="profile-card-dot">
                ●
              </span>

            </div>

            <h2>
              {hero.cardTitle.split(" ").slice(0, -2).join(" ")}
              <br />
              {hero.cardTitle.split(" ").slice(-2).join(" ")}
            </h2>

            <p>{hero.cardDescription}</p>

            <div className="profile-card-divider" />

            <div className="profile-card-tools">

              {hero.cardTools.map((tool) => <span key={tool}>{tool}</span>)}

            </div>

          </div>


          {/* Bottom information */}
          <div className="new-hero-side-info">

            <span className="side-info-number">
              {hero.projectCount}
            </span>

            <div>
              <strong>{hero.projectLabel}</strong>
              <small>
                Hands-on learning
              </small>
            </div>

          </div>

          <div className="new-hero-side-location">
            {hero.location}
            <span>•</span>
            {hero.period}
          </div>

        </div>

      </div>


      {/* BOTTOM */}
      <div className="new-hero-bottom">

        <span>
          {hero.bottomLeft}
        </span>

        <div className="new-hero-scroll-line">
          <span />
        </div>

        <span>
          {hero.bottomRight}
        </span>

      </div>

    </section>
  );
}