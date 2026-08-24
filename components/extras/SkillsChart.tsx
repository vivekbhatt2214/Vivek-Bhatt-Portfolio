"use client";
import { useEffect, useRef, useState } from "react";

const proficiency = [
  { label: "Data Analytics", value: 88, color: "var(--c-amber)" },
  { label: "MIS & Reporting", value: 90, color: "var(--c-pink)" },
  { label: "Excel & Power BI", value: 85, color: "var(--c-indigo)" },
  { label: "SQL & Databases", value: 80, color: "var(--c-teal)" },
  { label: "Python for Analytics", value: 72, color: "var(--c-lime)" },
  { label: "Dev & Tools", value: 76, color: "var(--c-amber)" },
];

export default function SkillsChart() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="vb-chart-card" ref={ref}>
      <div className="vb-chart-head">
        <span className="vb-chart-eyebrow">PROFICIENCY SNAPSHOT</span>
        <h3>How I'd rate myself, honestly.</h3>
      </div>
      <div className="vb-chart-rows">
        {proficiency.map((p) => (
          <div className="vb-chart-row" key={p.label}>
            <div className="vb-chart-row-label">
              <span>{p.label}</span>
              <strong style={{ color: p.color }}>{visible ? p.value : 0}%</strong>
            </div>
            <div className="vb-chart-track">
              <div
                className="vb-chart-fill"
                style={{
                  width: visible ? `${p.value}%` : "0%",
                  background: `linear-gradient(90deg, ${p.color}, ${p.color}99)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
