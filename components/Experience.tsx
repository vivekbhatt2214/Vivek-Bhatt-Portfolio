import { BriefcaseBusiness, CalendarDays } from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";

const entries = [
  {
    date: "2024",
    title: "Social Internship — Gramin Vigyan Samiti",
    text: "Worked on a field-oriented study of women empowerment through Self Help Groups at Panchayat level in Bageshwar, Uttarakhand. The experience strengthened observation, documentation, communication and the ability to convert field information into a structured report."
  },
  {
    date: "2025–2026",
    title: "Technical Internship / Project Work",
    text: "Developed hands-on projects across dashboards, databases, reporting and web applications. This stage has been focused on learning how to structure a problem, work with data, build a usable output and explain the result clearly rather than treating tools as isolated skills."
  },
  {
    date: "2023–2026",
    title: "BCA — Dev Bhoomi Uttarakhand University",
    text: "Built a broad foundation in computer applications, programming, databases, software engineering and modern development, while increasingly focusing that foundation toward Data Analytics, MIS Reporting, Business Intelligence and practical dashboard work."
  }
];

export default function Experience() {
  return (
    <section id="experience" className="section-pad section-alt">
      <SectionTitle eyebrow="Professional journey" title="Learning by building, testing and improving." />
      <div className="timeline">
        {entries.map((e, i) =>
          <div className={`timeline-item reveal delay-${i}`} key={e.title}>
            <div className="timeline-dot" />
            <div className="timeline-date"><CalendarDays size={15} />{e.date}</div>
            <div className="timeline-card"><div className="timeline-icon"><BriefcaseBusiness size={19} /></div><div><h3>{e.title}</h3><p>{e.text}</p></div></div>
          </div>
        )}
      </div>
    </section>
  );
}
