"use client";

import { Menu, X, MessageCircle, ArrowUpRight, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  ["About", "/portfolio#about"],
  ["Skills", "/portfolio#skills"],
  ["Education", "/portfolio#education"],
  ["Certifications", "/portfolio#certifications"],
  ["Projects", "/portfolio#projects"],
  ["Experience", "/portfolio#experience"],
  ["Contact", "/portfolio#contact"],
];

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/site", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((data) => setProfile(data?.profile || null)).catch(() => undefined);
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <Link href="/admin" className="admin-top-brand" onClick={() => setOpen(false)}>
          <span className="admin-top-mark">{profile?.avatarFileId ? <img src={`/api/files/${encodeURIComponent(String(profile.avatarFileId))}`} alt="" /> : "VB"}</span>
          <span className="admin-top-copy">
            <strong>{profile?.displayName || "Vivek Bhatt"}</strong>
            <small>Admin Workspace</small>
          </span>
        </Link>

        <nav className={open ? "admin-top-links open" : "admin-top-links"}>
          <Link href="/admin" className="admin-mobile-only-link" onClick={() => setOpen(false)}>
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link href="/portfolio" className="admin-mobile-only-link" onClick={() => setOpen(false)}>
            <ArrowUpRight size={15} /> Back to Portfolio
          </Link>
          <button type="button" className="admin-mobile-only-link admin-mobile-logout" onClick={logout} disabled={loggingOut}>
            <LogOut size={15} /> {loggingOut ? "Signing out…" : "Sign out"}
          </button>
          <Link
            href="/portfolio#contact"
            className="admin-top-cta"
            onClick={() => setOpen(false)}
          >
            <MessageCircle className="cta-bubble" size={15} />
            Let&apos;s Talk
          </Link>
        </nav>

        <div className="admin-desktop-actions">
          <Link href="/portfolio" className="admin-desktop-back">Back to Portfolio <ArrowUpRight size={13} /></Link>
          <button type="button" className="admin-desktop-logout" onClick={logout} disabled={loggingOut}>
            <LogOut size={13} /> {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        <button
          className="admin-top-menu"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
