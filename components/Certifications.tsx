"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Award,
  ExternalLink,
} from "lucide-react";

type Certificate = {
  id?: number | string;
  title: string;
  issuer?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
  imageUrl?: string;
  imageFileId?: number | string | null;
  fileUrl?: string;
  fileId?: number | string | null;
  description?: string;
  published?: boolean;
  sortOrder?: number | string;
};

/*
|--------------------------------------------------------------------------
| STATIC / CODE CERTIFICATES
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Ye certificates code se upload/display honge.
| Inko remove nahi kiya gaya hai.
|
*/

const staticCertificates: Certificate[] = [
  {
    id: "static-vam",
    title: "Advanced Logical Thinking in C",
    issuer: "Dev Bhoomi Uttarakhand University",
    issueDate: "January–April 2024",
    image: "/certifications/vam.jpg",
    description:
      "Successfully completed a 30-hour Value Added Course on Advanced Logical Thinking in C through the Career Development Cell.",
  },

  {
    id: "static-techsaksham",
    title: "AI: Transformative Learning with TechSaksham",
    issuer: "Microsoft • SAP • Edunet Foundation",
    issueDate: "2024",
    image: "/certifications/techsaksham.jpg",
    description:
      "Completed the AI: Transformative Learning with TechSaksham internship, a joint CSR initiative of Microsoft and SAP implemented by Edunet Foundation.",
  },

  {
    id: "static-cybersecurity",
    title: "Cybersecurity Analyst Job Simulation",
    issuer: "Tata • Forage",
    issueDate: "June 2025",
    image: "/certifications/cybersecurity.jpg",
    description:
      "Completed a Cybersecurity Analyst Job Simulation covering IAM fundamentals, IAM strategy assessment, custom IAM solutions and platform integration.",
  },

  {
    id: "static-java-beginner",
    title: "Java Programming Course for Beginners",
    issuer: "Crio.Do",
    issueDate: "2024",
    image: "/certifications/javabeginner.jpg",
    description:
      "Successfully completed a learning session focused on Java programming and Object-Oriented Programming fundamentals.",
  },

  {
    id: "static-leadership",
    title: "Leadership and Team Effectiveness",
    issuer: "NPTEL • IIT Roorkee",
    issueDate: "Jan–Apr 2026",
    image: "/certifications/Leadership Nptel.jpg",
    description:
      "Elite NPTEL certification with a consolidated score of 72% in Leadership and Team Effectiveness.",
  },

  {
    id: "static-java-assessment",
    title: "Java Assessment",
    issuer: "LearnTube by CareerNinja",
    issueDate: "September 2024",
    image: "/certifications/learntube.jpg",
    description:
      "Certificate of Completion for successfully completing the Java Assessment through LearnTube by CareerNinja.",
  },

  {
    id: "static-powerbi",
    title: "Data Analytics using Power BI",
    issuer: "Newton School",
    issueDate: "May 2025",
    image: "/certifications/powerbi.jpg",
    description:
      "Completed a workshop on Data Analytics using Power BI covering practical data analytics and business intelligence concepts.",
  },

  {
    id: "static-training-development",
    title: "Training and Development",
    issuer: "NPTEL • IIT Kharagpur",
    issueDate: "Jan–Apr 2026",
    image: "/certifications/training-development.jpg",
    description:
      "Elite NPTEL certification with a consolidated score of 80% in Training and Development.",
  },
];

/*
|--------------------------------------------------------------------------
| IMAGE URL
|--------------------------------------------------------------------------
*/

function getImageUrl(certificate: Certificate) {
  const imageFileId = certificate.imageFileId;

  if (
    imageFileId !== null &&
    imageFileId !== undefined &&
    String(imageFileId).trim() !== "" &&
    String(imageFileId) !== "NaN" &&
    String(imageFileId) !== "undefined"
  ) {
    return `/api/files/${encodeURIComponent(
      String(imageFileId)
    )}`;
  }

  return (
    certificate.imageUrl ||
    certificate.image ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| OPEN CERTIFICATE URL
|--------------------------------------------------------------------------
*/

function getOpenUrl(certificate: Certificate) {
  /*
   * If certificate image exists,
   * open the image in a new browser tab.
   */
  const imageUrl = getImageUrl(certificate);

  if (imageUrl) {
    return imageUrl;
  }

  if (certificate.credentialUrl) {
    return certificate.credentialUrl;
  }

  if (certificate.fileUrl) {
    return certificate.fileUrl;
  }

  if (
    certificate.fileId !== null &&
    certificate.fileId !== undefined &&
    String(certificate.fileId) !== "" &&
    String(certificate.fileId) !== "NaN"
  ) {
    return `/api/files/${encodeURIComponent(
      String(certificate.fileId)
    )}`;
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| TITLE NORMALIZATION
|--------------------------------------------------------------------------
*/

function normalizeTitle(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Certifications() {
  const [
    adminCertificates,
    setAdminCertificates,
  ] = useState<Certificate[]>([]);

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN CERTIFICATES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    fetch("/api/public-content", {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (
          Array.isArray(data?.certificates)
        ) {
          setAdminCertificates(
            data.certificates
          );
        }
      })
      .catch(() => {
        /*
         * If API is unavailable,
         * static/code certificates continue working.
         */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | MERGE STATIC + ADMIN CERTIFICATES
  |--------------------------------------------------------------------------
  */

  const certificates = useMemo(() => {
    const merged = new Map<
      string,
      Certificate
    >();

    /*
     * First add code certificates.
     */
    staticCertificates.forEach(
      (certificate) => {
        merged.set(
          normalizeTitle(
            certificate.title
          ),
          certificate
        );
      }
    );

    /*
     * Then add Admin certificates.
     *
     * If same title exists,
     * Admin version replaces code version.
     */
    adminCertificates
      .filter(
        (certificate) =>
          certificate?.published !== false
      )
      .forEach((certificate) => {
        const key = normalizeTitle(
          certificate.title
        );

        if (key) {
          merged.set(
            key,
            certificate
          );
        }
      });

    return Array.from(
      merged.values()
    );
  }, [adminCertificates]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <section
      id="certifications"
      className="certifications-section"
    >
      <div className="certifications-container">

        <div className="certifications-header reveal">

          <div className="certifications-eyebrow">
            <span className="certifications-dot" />

            05 / ACHIEVEMENTS & CERTIFICATIONS
          </div>

          <h2>
            Learning beyond the
            <br />
            <span>classroom.</span>
          </h2>

          <p>
            A collection of certifications and
            learning achievements that represent
            my continuous effort to build practical,
            job-ready technical skills.
          </p>

        </div>

        <div className="certifications-grid">

          {certificates.map(
            (certificate, index) => {
              const imageUrl =
                getImageUrl(
                  certificate
                );

              const openUrl =
                getOpenUrl(
                  certificate
                );

              const number =
                String(index + 1)
                  .padStart(2, "0");

              return (
                <article
                  key={
                    certificate.id != null
                      ? String(
                          certificate.id
                        )
                      : `${certificate.title}-${index}`
                  }
                  className={`certificate-card reveal ${
                    index === 1
                      ? "delay-1"
                      : index === 2
                      ? "delay-2"
                      : ""
                  }`}
                >

                  {/* =========================
                      CERTIFICATE IMAGE
                  ========================== */}

                  <div
                    className="certificate-image-wrapper"
                    style={{
                      position:
                        "relative",

                      height:
                        "auto",

                      minHeight: 0,

                      overflow:
                        "hidden",

                      cursor:
                        openUrl
                          ? "pointer"
                          : "default",

                      background:
                        "rgba(255,255,255,.025)",
                    }}
                  >

                    <div className="certificate-number">
                      {number}
                    </div>

                    {imageUrl ? (
                      <a
                        href={
                          openUrl ||
                          imageUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${certificate.title} certificate`}
                        style={{
                          display:
                            "block",

                          width:
                            "100%",

                          lineHeight:
                            0,

                          position:
                            "relative",

                          zIndex: 1,
                        }}
                      >

                        <img
                          src={imageUrl}
                          alt={`${certificate.title} certificate`}
                          className="certificate-image"
                          loading={
                            index < 3
                              ? "eager"
                              : "lazy"
                          }
                          style={{
                            position:
                              "static",

                            display:
                              "block",

                            width:
                              "100%",

                            height:
                              "auto",

                            maxWidth:
                              "100%",

                            objectFit:
                              "contain",

                            objectPosition:
                              "center",

                            margin: 0,
                          }}
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      </a>
                    ) : (
                      <div
                        className="certificate-empty"
                        style={{
                          minHeight:
                            260,

                          display:
                            "grid",

                          placeItems:
                            "center",
                        }}
                      >
                        <Award
                          size={34}
                        />

                        <span>
                          Credential uploaded
                        </span>
                      </div>
                    )}

                    <div
                      className="certificate-image-overlay"
                      style={{
                        pointerEvents:
                          "none",
                      }}
                    >
                      <span>
                        CERTIFICATE
                      </span>
                    </div>

                  </div>

                  {/* =========================
                      CERTIFICATE INFO
                  ========================== */}

                  <div className="certificate-info">

                    <div className="certificate-category">
                      {certificate.issuer ||
                        "PROFESSIONAL LEARNING"}
                    </div>

                    <h3>
                      {certificate.title}
                    </h3>

                    <p>
                      {certificate.description ||
                        "A credential supporting my technical and analytical development."}
                    </p>

                    <div className="certificate-bottom">

                      <span>
                        {certificate.issueDate ||
                          "Current"}
                      </span>

                      {openUrl ? (
                        <a
                          href={openUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(
                            event
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          Open certificate{" "}
                          <ArrowUpRight
                            size={14}
                          />
                        </a>
                      ) : (
                        <span>
                          <ExternalLink
                            size={13}
                          />{" "}
                          PORTFOLIO RECORD
                        </span>
                      )}

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>

        <div className="certifications-footer reveal">

          <div className="certifications-footer-line" />

          <div className="certifications-footer-content">

            <span>
              LEARNING • CERTIFYING • APPLYING
            </span>

            <p>
              Every certification adds another
              layer to my technical and
              professional growth.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}