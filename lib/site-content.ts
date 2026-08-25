export type SiteContent = {
  hero: {
    eyebrow: string;
    index: string;
    roleWords: string[];
    description: string;
    secondaryDescription: string;
    stats: { value: string; label: string }[];
    cardLabel: string;
    cardTitle: string;
    cardDescription: string;
    cardTools: string[];
    projectCount: string;
    projectLabel: string;
    location: string;
    period: string;
    bottomLeft: string;
    bottomRight: string;
  };
  education: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    items: Array<{
      number: string;
      level: string;
      title: string;
      institution: string;
      location: string;
      year: string;
      score: string;
      badge: string;
      image: string;
      status: string;
      focus: string;
    }>;
    footerLabel: string;
    footerText: string;
  };
  experience: {
    eyebrow: string;
    title: string;
    entries: Array<{ date: string; title: string; text: string }>;
  };
  contact: {
    eyebrow: string;
    title: string;
    text: string;
    email: string;
    linkedin: string;
    github: string;
    location: string;
  };
  footer: {
    description: string;
    linkedin: string;
    github: string;
    ctaLabel: string;
    ctaTitle: string;
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    eyebrow: "WELCOME TO MY PORTFOLIO",
    index: "DATA ANALYTICS • MIS • BUSINESS INTELLIGENCE",
    roleWords: ["Data Analytics", "MIS Reporting", "Business Intelligence", "Power BI Dashboards", "SQL & Python"],
    description: "I am Vivek Bhatt, a BCA professional building a career in Data Analytics, MIS Reporting and Business Intelligence through practical projects and structured problem solving.",
    secondaryDescription: "I work with Excel, SQL, Power BI and Python to explore data, discover useful patterns and present information in a simple and meaningful way.",
    stats: [
      { value: "8.0", label: "CGPA" },
      { value: "04+", label: "PROJECTS" },
      { value: "2026", label: "GRADUATION" },
    ],
    cardLabel: "CURRENTLY BUILDING",
    cardTitle: "Turning learning into real projects.",
    cardDescription: "Exploring data, creating dashboards and developing practical analytical solutions while preparing for my professional career.",
    cardTools: ["EXCEL", "SQL", "POWER BI", "PYTHON"],
    projectCount: "04+",
    projectLabel: "PROJECTS",
    location: "INDIA",
    period: "2023—26",
    bottomLeft: "SCROLL TO EXPLORE",
    bottomRight: "DATA • ANALYSIS • GROWTH",
  },
  education: {
    eyebrow: "Academic journey",
    title: "From school foundations",
    titleAccent: "to a career in technology.",
    description: "My academic journey has helped me build a strong foundation in computer applications while developing the analytical and technical skills I use in my projects today.",
    items: [
      { number: "01", level: "SECONDARY EDUCATION", title: "Class 10th", institution: "Kendriya Vidyalaya Kausani", location: "Bageshwar, Uttarakhand", year: "2021", score: "75.6%", badge: "10TH", image: "/education/kv-kausani.jpg", status: "Completed 2021", focus: "" },
      { number: "02", level: "SENIOR SECONDARY EDUCATION", title: "Class 12th", institution: "Kendriya Vidyalaya Kausani", location: "Bageshwar, Uttarakhand", year: "2023", score: "87%", badge: "12TH", image: "/education/kv-kausani.jpg", status: "Completed 2023", focus: "" },
      { number: "03", level: "UNDERGRADUATE DEGREE", title: "Bachelor of Computer Applications", institution: "Dev Bhoomi Uttarakhand University", location: "Dehradun, Uttarakhand, India", year: "2023 — 2026", score: "8.0", badge: "", image: "/education/dbuu.jpg", status: "COMPLETED", focus: "Computer Applications" },
    ],
    footerLabel: "LEARNING → BUILDING → GROWING",
    footerText: "Building practical skills through education, projects and continuous learning.",
  },
  experience: {
    eyebrow: "Professional journey",
    title: "Learning by building, testing and improving.",
    entries: [
      { date: "2024", title: "Social Internship — Gramin Vigyan Samiti", text: "Worked on a field-oriented study of women empowerment through Self Help Groups at Panchayat level in Bageshwar, Uttarakhand. The experience strengthened observation, documentation, communication and the ability to convert field information into a structured report." },
      { date: "2025–2026", title: "Technical Internship / Project Work", text: "Developed hands-on projects across dashboards, databases, reporting and web applications. This stage has been focused on learning how to structure a problem, work with data, build a usable output and explain the result clearly rather than treating tools as isolated skills." },
      { date: "2023–2026", title: "BCA — Dev Bhoomi Uttarakhand University", text: "Built a broad foundation in computer applications, programming, databases, software engineering and modern development, while increasingly focusing that foundation toward Data Analytics, MIS Reporting, Business Intelligence and practical dashboard work." },
    ],
  },
  contact: {
    eyebrow: "Let's connect",
    title: "Let’s build something useful with data.",
    text: "Whether you are hiring for an analytics role, discussing a project, or exploring a collaboration, send a message and I’ll respond after email verification.",
    email: "vb7830149108@gmail.com",
    linkedin: "https://www.linkedin.com/in/vivek-bhatt-data-analytics",
    github: "https://github.com/vivekbhatt2214/VivekBhatt",
    location: "Bageshwar, Uttarakhand, India",
  },
  footer: {
    description: "Transforming data into business growth through structured analysis, reporting and practical dashboards.",
    linkedin: "https://www.linkedin.com/in/vivek-bhatt-data-analytics",
    github: "https://github.com/vivekbhatt2214/VivekBhatt",
    ctaLabel: "OPEN TO OPPORTUNITIES",
    ctaTitle: "Let’s talk about data.",
  },
};

function cleanList(value: unknown, fallback: string[], max = 20) {
  return Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean).slice(0, max) : fallback;
}

export function normalizeSiteContent(input: unknown): SiteContent {
  const x = input && typeof input === "object" ? input as Record<string, any> : {};
  const hero = x.hero && typeof x.hero === "object" ? x.hero : {};
  const education = x.education && typeof x.education === "object" ? x.education : {};
  const experience = x.experience && typeof x.experience === "object" ? x.experience : {};
  const contact = x.contact && typeof x.contact === "object" ? x.contact : {};
  const footer = x.footer && typeof x.footer === "object" ? x.footer : {};

  return {
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      ...hero,
      eyebrow: String(hero.eyebrow ?? DEFAULT_SITE_CONTENT.hero.eyebrow).trim(),
      index: String(hero.index ?? DEFAULT_SITE_CONTENT.hero.index).trim(),
      roleWords: cleanList(hero.roleWords, DEFAULT_SITE_CONTENT.hero.roleWords, 10),
      description: String(hero.description ?? DEFAULT_SITE_CONTENT.hero.description).trim(),
      secondaryDescription: String(hero.secondaryDescription ?? DEFAULT_SITE_CONTENT.hero.secondaryDescription).trim(),
      stats: Array.isArray(hero.stats) ? hero.stats.slice(0, 6).map((s: any, i: number) => ({ value: String(s?.value ?? DEFAULT_SITE_CONTENT.hero.stats[i]?.value ?? ""), label: String(s?.label ?? DEFAULT_SITE_CONTENT.hero.stats[i]?.label ?? "") })).filter((s: any) => s.value || s.label) : DEFAULT_SITE_CONTENT.hero.stats,
      cardLabel: String(hero.cardLabel ?? DEFAULT_SITE_CONTENT.hero.cardLabel).trim(),
      cardTitle: String(hero.cardTitle ?? DEFAULT_SITE_CONTENT.hero.cardTitle).trim(),
      cardDescription: String(hero.cardDescription ?? DEFAULT_SITE_CONTENT.hero.cardDescription).trim(),
      cardTools: cleanList(hero.cardTools, DEFAULT_SITE_CONTENT.hero.cardTools, 10),
      projectCount: String(hero.projectCount ?? DEFAULT_SITE_CONTENT.hero.projectCount).trim(),
      projectLabel: String(hero.projectLabel ?? DEFAULT_SITE_CONTENT.hero.projectLabel).trim(),
      location: String(hero.location ?? DEFAULT_SITE_CONTENT.hero.location).trim(),
      period: String(hero.period ?? DEFAULT_SITE_CONTENT.hero.period).trim(),
      bottomLeft: String(hero.bottomLeft ?? DEFAULT_SITE_CONTENT.hero.bottomLeft).trim(),
      bottomRight: String(hero.bottomRight ?? DEFAULT_SITE_CONTENT.hero.bottomRight).trim(),
    },
    education: {
      ...DEFAULT_SITE_CONTENT.education,
      ...education,
      eyebrow: String(education.eyebrow ?? DEFAULT_SITE_CONTENT.education.eyebrow).trim(),
      title: String(education.title ?? DEFAULT_SITE_CONTENT.education.title).trim(),
      titleAccent: String(education.titleAccent ?? DEFAULT_SITE_CONTENT.education.titleAccent).trim(),
      description: String(education.description ?? DEFAULT_SITE_CONTENT.education.description).trim(),
      items: Array.isArray(education.items) ? education.items.slice(0, 10).map((item: any, i: number) => ({ ...DEFAULT_SITE_CONTENT.education.items[i % DEFAULT_SITE_CONTENT.education.items.length], ...item, number: String(item?.number ?? String(i + 1).padStart(2, "0")), level: String(item?.level ?? ""), title: String(item?.title ?? ""), institution: String(item?.institution ?? ""), location: String(item?.location ?? ""), year: String(item?.year ?? ""), score: String(item?.score ?? ""), badge: String(item?.badge ?? ""), image: String(item?.image ?? ""), status: String(item?.status ?? ""), focus: String(item?.focus ?? "") })) : DEFAULT_SITE_CONTENT.education.items,
      footerLabel: String(education.footerLabel ?? DEFAULT_SITE_CONTENT.education.footerLabel).trim(),
      footerText: String(education.footerText ?? DEFAULT_SITE_CONTENT.education.footerText).trim(),
    },
    experience: {
      ...DEFAULT_SITE_CONTENT.experience,
      ...experience,
      eyebrow: String(experience.eyebrow ?? DEFAULT_SITE_CONTENT.experience.eyebrow).trim(),
      title: String(experience.title ?? DEFAULT_SITE_CONTENT.experience.title).trim(),
      entries: Array.isArray(experience.entries) ? experience.entries.slice(0, 12).map((e: any) => ({ date: String(e?.date ?? ""), title: String(e?.title ?? ""), text: String(e?.text ?? "") })).filter((e: any) => e.title || e.text) : DEFAULT_SITE_CONTENT.experience.entries,
    },
    contact: {
      ...DEFAULT_SITE_CONTENT.contact,
      ...contact,
      eyebrow: String(contact.eyebrow ?? DEFAULT_SITE_CONTENT.contact.eyebrow).trim(),
      title: String(contact.title ?? DEFAULT_SITE_CONTENT.contact.title).trim(),
      text: String(contact.text ?? DEFAULT_SITE_CONTENT.contact.text).trim(),
      email: String(contact.email ?? DEFAULT_SITE_CONTENT.contact.email).trim().toLowerCase(),
      linkedin: String(contact.linkedin ?? DEFAULT_SITE_CONTENT.contact.linkedin).trim(),
      github: String(contact.github ?? DEFAULT_SITE_CONTENT.contact.github).trim(),
      location: String(contact.location ?? DEFAULT_SITE_CONTENT.contact.location).trim(),
    },
    footer: {
      ...DEFAULT_SITE_CONTENT.footer,
      ...footer,
      description: String(footer.description ?? DEFAULT_SITE_CONTENT.footer.description).trim(),
      linkedin: String(footer.linkedin ?? DEFAULT_SITE_CONTENT.footer.linkedin).trim(),
      github: String(footer.github ?? DEFAULT_SITE_CONTENT.footer.github).trim(),
      ctaLabel: String(footer.ctaLabel ?? DEFAULT_SITE_CONTENT.footer.ctaLabel).trim(),
      ctaTitle: String(footer.ctaTitle ?? DEFAULT_SITE_CONTENT.footer.ctaTitle).trim(),
    },
  };
}
