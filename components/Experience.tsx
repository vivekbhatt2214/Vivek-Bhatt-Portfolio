"use client";

import { BriefcaseBusiness, CalendarDays } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function Experience() {
  const { siteContent } = useSiteContent();
  const experience = siteContent.experience;
  return (
    <section id="experience" className="section-pad section-alt">
      <SectionTitle eyebrow={experience.eyebrow} title={experience.title} />
      <div className="timeline">
        {experience.entries.map((entry, index) => (
          <div className={`timeline-item reveal delay-${Math.min(index, 3)}`} key={`${entry.date}-${entry.title}`}>
            <div className="timeline-dot" />
            <div className="timeline-date"><CalendarDays size={15} />{entry.date}</div>
            <div className="timeline-card"><div className="timeline-icon"><BriefcaseBusiness size={19} /></div><div><h3>{entry.title}</h3><p>{entry.text}</p></div></div>
          </div>
        ))}
      </div>
    </section>
  );
}
