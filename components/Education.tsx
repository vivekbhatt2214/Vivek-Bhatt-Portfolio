"use client";

import { useSiteContent } from "@/components/SiteContentProvider";

export default function Education() {
  const { siteContent } = useSiteContent();
  const education = siteContent.education;

  return (
    <section id="education" className="education-section">
      <div className="education-container">
        <div className="education-header reveal">
          <div className="education-eyebrow"><span className="education-status-dot" />{education.eyebrow}</div>
          <h2>{education.title}<br /><span>{education.titleAccent}</span></h2>
          <p>{education.description}</p>
        </div>

        <div className="education-timeline">
          {education.items.map((item, index) => (
            <article className={`education-item ${index === education.items.length - 1 ? "education-current" : ""} reveal delay-${Math.min(index, 3)}`} key={`${item.number}-${item.title}`}>
              <div className="education-marker"><span>{item.number}</span></div>
              <div className="education-card">
                <div className="education-card-top">
                  <div className="education-institution-image">
                    {item.image ? <img src={item.image} alt={item.institution} /> : <span>ED</span>}
                  </div>
                  {index === education.items.length - 1 ? <div className="education-current-badge">{item.status || "CURRENT"}</div> : <div className="education-year">{item.year}</div>}
                </div>
                <div className="education-content">
                  <span className="education-level">{item.level}</span>
                  <h3>{item.title}</h3>
                  <h4>{item.institution}</h4>
                  <div className="education-meta"><span>📍 {item.location}</span><span>✓ {index === education.items.length - 1 ? item.year : item.status}</span></div>
                  <div className={`education-result ${index === education.items.length - 1 ? "education-degree" : ""}`}>
                    <div><small>{index === education.items.length - 1 ? "CGPA" : "ACADEMIC SCORE"}</small><strong>{item.score}</strong></div>
                    {index === education.items.length - 1 ? <div className="degree-focus"><small>ACADEMIC FOCUS</small><span>{item.focus}</span></div> : <span className="education-result-badge">{item.badge}</span>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="education-footer reveal">
          <div className="education-footer-line" />
          <div className="education-footer-content"><span>{education.footerLabel}</span><p>{education.footerText}</p></div>
        </div>
      </div>
    </section>
  );
}
