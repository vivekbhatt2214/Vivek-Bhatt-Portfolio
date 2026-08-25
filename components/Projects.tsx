"use client";

import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, Github, X } from "lucide-react";

type Project = {
  id?: number | string | null;
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  category: string;
  technologies: string | any[];
  image?: string | null;
  imageUrl?: string | null;
  imageFileId?: number | string | null;
  githubUrl?: string;
  liveUrl?: string;
  projectFileUrl?: string;
  projectFileName?: string;
  projectFileType?: string;
  featured?: boolean;
};

const STATIC_PROJECT_IMAGES: Record<string, string> = {
  "swiggy-sales-dashboard": "/projects/swiggy.png",
  "hr-analytics-dashboard": "/projects/hr.png",
  "blinkit-sales-dashboard": "/projects/blinkit.png",
  "starbucks-analytics-dashboard": "/projects/starbucks-dashboard.png",
  "phonepe-transaction-analytics-dashboard": "/projects/phonepe.png",
};

function parseTech(value: any) {
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.map(String)
      : String(value || "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
  } catch {
    return String(value || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}

function getImageSource(project: Project) {
  const fileId = project.imageFileId == null ? "" : String(project.imageFileId).trim();
  if (fileId && fileId !== "NaN" && fileId !== "undefined" && fileId !== "null") {
    return `/api/files/${encodeURIComponent(fileId)}`;
  }
  if (project.imageUrl?.trim()) return project.imageUrl.trim();
  if (project.image?.trim()) return project.image.trim();
  return STATIC_PROJECT_IMAGES[project.slug] || "";
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState("All");
  const [download, setDownload] = useState<Project | null>(null);
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))),
  ];

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.category === filter),
    [filter, projects]
  );

  const openDownload = (event: MouseEvent, project: Project) => {
    event.preventDefault();
    event.stopPropagation();
    setDownload(project);
    setEmail("");
    setRequestId(null);
    setOtp("");
    setError("");
    setSuccess("");
  };

  const send = async () => {
    setError("");
    setSuccess("");

    if (!download || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setBusy(true);
      const response = await fetch("/api/project-download/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: download.slug, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send code.");
      setRequestId(Number(data.id));
      setSuccess("Verification code sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send code.");
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError("");
    if (!requestId || !/^[0-9]{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }

    try {
      setBusy(true);
      const response = await fetch("/api/project-download/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: requestId, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed.");
      setSuccess("Email verified. Your download is ready.");
      window.setTimeout(() => {
        window.location.href = data.downloadUrl;
        setDownload(null);
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section id="projects" className="section-pad projects-premium-section">
        <div className="section-title-row reveal">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2>Projects that explain the analysis, not only the dashboard.</h2>
          </div>
          <p>
            Every project is presented as a compact case study so visitors can
            understand the business question, workflow, tools, insights and
            outcome behind the final visual.
          </p>
        </div>

        <div className="filter-row reveal">
          {categories.map((category) => (
            <button
              key={category}
              className={filter === category ? "active" : ""}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {filtered.map((project, index) => {
            const technologies = parseTech(project.technologies);
            const projectKey =
              project.id != null && String(project.id) !== "NaN"
                ? String(project.id)
                : `${project.slug || "project"}-${index}`;
            const imageSource = getImageSource(project);
            const fallbackImage = STATIC_PROJECT_IMAGES[project.slug] || "";

            return (
              <article
                className={`project-card reveal delay-${Math.min(index, 3)}`}
                key={projectKey}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="project-card-link"
                  onClick={() => {
                    fetch("/api/analytics/track", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionId:
                          localStorage.getItem("vivek_portfolio_session") ||
                          "anonymous-session",
                        eventType: "project_view",
                        page: window.location.pathname,
                        metadata: {
                          projectSlug: project.slug,
                          projectTitle: project.title,
                        },
                      }),
                      keepalive: true,
                    }).catch(() => {});
                  }}
                >
                  <div className="project-media">
                    {imageSource ? (
                      <img
                        src={imageSource}
                        alt={`${project.title} dashboard`}
                        loading="lazy"
                        onError={(event) => {
                          const image = event.currentTarget;
                          if (fallbackImage && image.src !== window.location.origin + fallbackImage) {
                            image.src = fallbackImage;
                            return;
                          }
                          image.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="project-media-fallback"
                        aria-label={`${project.title} dashboard image unavailable`}
                      >
                        <span>Dashboard Preview</span>
                      </div>
                    )}
                    <span className="project-overlay">
                      <span>Open case study</span>
                      <ArrowUpRight size={17} />
                    </span>
                  </div>

                  <div className="project-body">
                    <div className="project-meta">
                      <span>{project.category}</span>
                      <span>Case study</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className="project-tech-row">
                      {technologies.slice(0, 5).map((technology) => (
                        <span key={technology}>{technology}</span>
                      ))}
                    </div>
                  </div>
                </Link>

                <div className="project-actions">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-analytics="project_github_click"
                    >
                      <Github size={16} /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      data-analytics="project_live_click"
                    >
                      <ArrowUpRight size={16} /> Live
                    </a>
                  )}
                  <button
                    onClick={(event) => openDownload(event, project)}
                    data-analytics="project_download_request"
                  >
                    <Download size={16} /> Download files
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {download && (
        <div className="premium-modal-backdrop">
          <div className="premium-modal download-modal">
            <button className="modal-close" onClick={() => setDownload(null)}>
              <X />
            </button>
            <div className="modal-icon">
              <Download />
            </div>
            <span className="eyebrow">VERIFIED PROJECT DOWNLOAD</span>
            <h3>{download.title}</h3>

            {!requestId ? (
              <>
                <p>
                  Enter your email. A verification code will be sent before the
                  project files can be downloaded.
                </p>
                <input
                  className="premium-modal-input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
                {error && <div className="form-message form-error">{error}</div>}
                {success && (
                  <div className="form-message form-success">{success}</div>
                )}
                <button
                  className="contact-submit"
                  disabled={busy}
                  onClick={send}
                >
                  {busy ? "Sending…" : "Send verification code"}
                </button>
              </>
            ) : (
              <>
                <p>
                  We sent a 6-digit code to <strong>{email}</strong>.
                </p>
                <input
                  className="otp-input-premium"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  placeholder="000000"
                />
                {error && <div className="form-message form-error">{error}</div>}
                {success && (
                  <div className="form-message form-success">{success}</div>
                )}
                <button
                  className="contact-submit"
                  disabled={busy}
                  onClick={verify}
                >
                  {busy ? "Verifying…" : "Verify & download"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
