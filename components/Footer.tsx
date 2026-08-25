"use client";

import Link from "next/link";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

export default function Footer() {
  const { profile, siteContent } = useSiteContent();
  const footer = siteContent.footer;
  const name = profile.displayName || "Vivek Bhatt";
  return <footer className="premium-footer"><div className="footer-inner premium-footer-inner"><div className="footer-brand"><div className="footer-mark">VB</div><div><strong>{name}</strong><span>{profile.headline}</span></div><p>{footer.description}</p></div><div className="footer-links"><span>EXPLORE</span><Link href="/portfolio#about">About</Link><Link href="/portfolio#skills">Skills</Link><Link href="/portfolio#projects">Projects</Link><Link href="/portfolio#resume">Resume</Link></div><div className="footer-links"><span>CONNECT</span><a href={footer.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14}/> LinkedIn</a><a href={footer.github} target="_blank" rel="noreferrer"><Github size={14}/> GitHub</a><Link href="/portfolio#contact">Contact <ArrowUpRight size={14}/></Link></div><div className="footer-cta"><span>{footer.ctaLabel}</span><strong>{footer.ctaTitle}</strong><Link href="/portfolio#booking">Book an interview <ArrowUpRight size={15}/></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {name}</span><span>PostgreSQL • Next.js • Analytics</span><a href="#top">Back to top ↑</a></div></footer>;
}
