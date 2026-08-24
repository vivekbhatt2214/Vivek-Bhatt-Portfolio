 "use client";

import { Menu, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <Link href="/admin" className="admin-top-brand" onClick={() => setOpen(false)}>
          <span className="admin-top-mark">VB</span>
          <span className="admin-top-copy">
            <strong>Vivek Bhatt</strong>
            <small>Admin Workspace</small>
          </span>
        </Link>

        <nav className={open ? "admin-top-links open" : "admin-top-links"}>
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <Link
            href="/portfolio#contact"
            className="admin-top-cta"
            onClick={() => setOpen(false)}
          >
            <MessageCircle className="cta-bubble" size={15} />
            Let&apos;s Talk
          </Link>
        </nav>

        <button
          className="admin-top-menu"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
