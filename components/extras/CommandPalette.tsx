"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ElementType, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  Search,
  User,
  Layers3,
  GraduationCap,
  Award,
  FolderKanban,
  Briefcase,
  FileText,
  Mail,
  CalendarClock,
  CornerDownLeft,
  Command,
} from "lucide-react";

type Item = {
  label: string;
  hint: string;
  href: string;
  icon: ElementType;
  color: string;
};

const items: Item[] = [
  { label: "About", hint: "Who I am", href: "#about", icon: User, color: "var(--c-amber)" },
  { label: "Skills", hint: "Tools & capabilities", href: "#skills", icon: Layers3, color: "var(--c-indigo)" },
  { label: "Education", hint: "Academic background", href: "#education", icon: GraduationCap, color: "var(--c-teal)" },
  { label: "Certifications", hint: "Credentials", href: "#certifications", icon: Award, color: "var(--c-pink)" },
  { label: "Projects", hint: "Things I've built", href: "#projects", icon: FolderKanban, color: "var(--c-lime)" },
  { label: "Experience", hint: "Journey so far", href: "#experience", icon: Briefcase, color: "var(--c-amber)" },
  { label: "Resume", hint: "View / download CV", href: "#resume", icon: FileText, color: "var(--c-indigo)" },
  { label: "Contact", hint: "Get in touch", href: "#contact", icon: Mail, color: "var(--c-teal)" },
  { label: "Book an interview", hint: "Schedule a slot", href: "#booking", icon: CalendarClock, color: "var(--c-pink)" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q)
    );
  }, [query]);

  function go(href: string) {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onKeyDown(e: ReactKeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) go(filtered[active].href);
    }
  }

  return (
    <>
      <button
        className="vb-cmdk-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Search size={14} />
        <span>Quick jump</span>
        <span className="vb-cmdk-kbd">
          <Command size={11} />K
        </span>
      </button>

      {open && (
        <div className="vb-cmdk-backdrop" onMouseDown={() => setOpen(false)}>
          <div
            className="vb-cmdk-panel"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="vb-cmdk-search">
              <Search size={17} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Jump to a section… (About, Projects, Contact)"
              />
              <span className="vb-cmdk-esc">ESC</span>
            </div>
            <div className="vb-cmdk-list">
              {filtered.length === 0 && (
                <div className="vb-cmdk-empty">No matches. Try “projects” or “contact”.</div>
              )}
              {filtered.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    className={i === active ? "vb-cmdk-item active" : "vb-cmdk-item"}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item.href)}
                    style={{ "--item-color": item.color } as CSSProperties}
                  >
                    <span className="vb-cmdk-icon">
                      <Icon size={16} />
                    </span>
                    <span className="vb-cmdk-text">
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                    <CornerDownLeft size={14} className="vb-cmdk-enter" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
