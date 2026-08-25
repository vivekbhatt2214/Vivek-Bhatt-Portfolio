"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_SITE_CONTENT, type SiteContent, normalizeSiteContent } from "@/lib/site-content";

type Profile = {
  displayName: string;
  headline: string;
  avatarFileId: string | null;
  aboutIntro: string;
  aboutSecondary: string;
  aboutHighlights: string[];
  careerGoal: string;
  careerSubline: string;
  cgpa: string;
  projectStat: string;
  analyticsStat: string;
  strengths: string[];
  values: string[];
  interests: string[];
  tools: string[];
  skillsGroups: any[];
};

const DEFAULT_PROFILE: Profile = {
  displayName: "Vivek Bhatt",
  headline: "Data Analytics • MIS • Business Intelligence",
  avatarFileId: null,
  aboutIntro: "I am a BCA graduate and aspiring Data Analyst with a growing interest in turning raw information into clear, meaningful insights.",
  aboutSecondary: "I am building my practical knowledge through hands-on projects using MS Excel, SQL, Power BI and Python. My focus is on understanding data, finding patterns, creating useful dashboards and presenting information in a simple and understandable way.",
  aboutHighlights: ["BCA graduate with a strong interest in Data Analytics", "Hands-on experience through self-driven projects", "Building dashboards and analytical reports", "Focused on developing job-ready analytical skills"],
  careerGoal: "Data Analyst",
  careerSubline: "Business Intelligence",
  cgpa: "8.0",
  projectStat: "4+",
  analyticsStat: "6+",
  strengths: ["Analytical thinking", "Problem solving", "Attention to detail", "Data visualization"],
  values: ["Continuous learning", "Accuracy & consistency", "Practical approach", "Professional growth"],
  interests: ["Data Analytics", "Business Intelligence", "Dashboard Design", "Data Visualization"],
  tools: ["MS Excel", "SQL", "Power BI", "Python"],
  skillsGroups: [],
};

type ContextValue = { profile: Profile; siteContent: SiteContent };
const Context = createContext<ContextValue>({ profile: DEFAULT_PROFILE, siteContent: DEFAULT_SITE_CONTENT });

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ContextValue>({ profile: DEFAULT_PROFILE, siteContent: DEFAULT_SITE_CONTENT });

  useEffect(() => {
    fetch("/api/public-site", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) return;
        setValue({
          profile: { ...DEFAULT_PROFILE, ...(data.profile || {}) },
          siteContent: normalizeSiteContent(data.siteContent),
        });
      })
      .catch(() => undefined);
  }, []);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSiteContent() {
  return useContext(Context);
}
