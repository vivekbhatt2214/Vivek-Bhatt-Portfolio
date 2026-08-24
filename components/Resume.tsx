"use client";

import { useEffect, useState } from "react";
import { Download, Eye, FileText, X } from "lucide-react";

type ResumeData = {
  id?: string | number;
  title: string;
  version?: string;
  description?: string;
  fileUrl: string;
  downloadUrl?: string;
  fileName?: string;
};

export default function Resume() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public-content", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        if (data?.resume) {
          setResume(data.resume);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * IMPORTANT:
   * fileUrl is the normal browser-view URL.
   * downloadUrl is used only for downloading.
   */
  const resumePath =
    resume?.fileUrl || "/resume/Vivek-Bhatt-Resume.pdf";

  const downloadPath =
    resume?.downloadUrl || resumePath;

  const track = (type: string) => {
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId:
            localStorage.getItem("vivek_portfolio_session") ||
            "anonymous-session",
          eventType: type,
          page: window.location.pathname,
          metadata: {
            label: "Resume",
          },
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Analytics must never block resume actions.
    }
  };

  const handleViewResume = () => {
    setPreview(true);
    track("resume_view");
  };

  const handleCloseResume = () => {
    setPreview(false);
  };

  const handleDownloadResume = () => {
    track("resume_download");
  };

  return (
    <section id="resume" className="resume-section">
      <div className="resume-container">

        {/* =========================
            HEADER
        ========================== */}
        <div className="resume-header reveal">
          <div className="resume-eyebrow">
            <span className="resume-status-dot" />
            PROFESSIONAL RESUME
          </div>

          <h2>
            A current snapshot of{" "}
            <span>my professional profile.</span>
          </h2>

          <p>
            The latest published CV can be updated from the Admin Content
            Studio without changing portfolio code.
          </p>
        </div>

        {/* =========================
            RESUME CARD
        ========================== */}
        <div className="resume-card reveal">

          <div className="resume-info">

            <div className="resume-document-icon">
              <FileText />
            </div>

            <div className="resume-info-content">

              <span className="resume-label">
                CURRENT RESUME
              </span>

              <h3>
                {resume?.title ||
                  "Vivek Bhatt — Data Analyst"}
              </h3>

              <p className="resume-role">
                Data Analytics • MIS Reporting • Business Intelligence
              </p>

              <p className="resume-description">
                {resume?.description ||
                  "A concise profile covering education, analytics skills, projects, internships and professional development."}
              </p>

              <div className="resume-meta">
                <span>PDF</span>
                <span>•</span>
                <span>
                  {resume?.version || "Current version"}
                </span>
              </div>

            </div>
          </div>

          {/* =========================
              ACTION BUTTONS
          ========================== */}
          <div className="resume-actions">

            {/* VIEW */}
            <button
              type="button"
              className="resume-view-btn"
              onClick={handleViewResume}
            >
              <Eye size={17} />

              <span>
                View Resume
              </span>
            </button>

            {/* DOWNLOAD */}
            <a
              href={downloadPath}
              download={
                resume?.fileName ||
                "Vivek-Bhatt-Resume.pdf"
              }
              className="resume-download-btn"
              onClick={handleDownloadResume}
            >
              <Download size={17} />

              <span>
                Download Resume
              </span>
            </a>

          </div>
        </div>

        {/* =========================
            QUICK HIGHLIGHTS
        ========================== */}
        <div className="resume-highlights reveal">

          <div className="resume-highlight">
            <strong>
              Data Analytics
            </strong>

            <small>
              Excel • SQL • Power BI • Python
            </small>
          </div>

          <div className="resume-highlight">
            <strong>
              MIS &amp; Reporting
            </strong>

            <small>
              KPI reporting • dashboards • data validation
            </small>
          </div>

          <div className="resume-highlight">
            <strong>
              Professional focus
            </strong>

            <small>
              Clear analysis, structured reporting and business-ready
              presentation
            </small>
          </div>

        </div>
      </div>

      {/* =========================
          RESUME PREVIEW MODAL
      ========================== */}
      {preview && (
        <div
          className="premium-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Resume preview"
        >

          <div className="resume-preview-modal">

            {/* CLOSE */}
            <button
              type="button"
              className="modal-close"
              onClick={handleCloseResume}
              aria-label="Close resume preview"
            >
              <X />
            </button>

            {/* PDF VIEW */}
            <iframe
              src={resumePath}
              title="Vivek Bhatt Resume"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />

            {/* MODAL FOOTER */}
            <div className="resume-preview-footer">

              <span>
                Current published CV
              </span>

              <a
                href={downloadPath}
                download={
                  resume?.fileName ||
                  "Vivek-Bhatt-Resume.pdf"
                }
                onClick={handleDownloadResume}
              >
                <Download size={16} />

                Download
              </a>

            </div>

          </div>
        </div>
      )}
    </section>
  );
}