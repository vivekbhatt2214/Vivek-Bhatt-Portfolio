"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Eye, UploadCloud } from "lucide-react";

type Project = {
  id?: number | string;
  title: string;
  slug: string;
  shortTitle?: string;
  category: string;
  description: string;
  overview?: string;
  workDone?: string;
  methodology?: string;
  insights?: string;
  outcome?: string;
  technologies?: string | string[];
  image?: string;
  imageUrl?: string;
  imageFileId?: number | string | null;
  githubUrl?: string;
  liveUrl?: string;
  projectFileUrl?: string;
  projectFileName?: string;
  projectFileType?: string;
  projectFileId?: number | string | null;
  gallery?: string | string[];
  published: boolean;
  featured: boolean;
  sortOrder?: number | string;
};

type Certificate = {
  id?: number | string;
  title: string;
  issuer?: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  imageFileId?: number | string | null;
  fileUrl?: string;
  fileId?: number | string | null;
  description?: string;
  published: boolean;
  sortOrder?: number | string;
};

type Resume = {
  id?: number | string;
  title: string;
  version?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileId?: number | string | null;
  published: boolean;
};

const emptyProject: Project = {
  title: "",
  slug: "",
  shortTitle: "",
  category: "Data Analytics",
  description: "",
  overview: "",
  workDone: "",
  methodology: "",
  insights: "",
  outcome: "",
  technologies: "Excel, SQL, Power BI",
  image: "",
  imageFileId: "",
  githubUrl: "",
  liveUrl: "",
  projectFileUrl: "",
  projectFileName: "",
  projectFileType: "",
  projectFileId: "",
  gallery: "",
  featured: false,
  published: true,
  sortOrder: "0",
};

const emptyCertificate: Certificate = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
  imageUrl: "",
  fileUrl: "",
  imageFileId: "",
  fileId: "",
  description: "",
  published: true,
  sortOrder: "0",
};

const emptyResume: Resume = {
  title: "",
  version: "",
  description: "",
  fileUrl: "",
  fileName: "",
  fileId: "",
  published: true,
};

const staticProjectImages: Record<string, string> = {
  "swiggy-sales-dashboard": "/projects/swiggy.png",
  "hr-analytics-dashboard": "/projects/hr.png",
  "blinkit-sales-dashboard": "/projects/blinkit.png",
  "starbucks-analytics-dashboard": "/projects/starbucks-dashboard.png",
  "phonepe-transaction-analytics-dashboard": "/projects/phonepe.png",
};

function toList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    // comma-separated fallback
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Manage() {
  const [tab, setTab] = useState("projects");

  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);

  const [project, setProject] = useState<Project>(emptyProject);
  const [certificate, setCertificate] =
    useState<Certificate>(emptyCertificate);
  const [resume, setResume] = useState<Resume>(emptyResume);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch("/api/admin/content", {
        cache: "no-store",
        signal: controller.signal,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load portfolio content."
        );
      }

      setProjects(data.projects || []);
      setCertificates(data.certificates || []);
      setResumes(data.resumes || []);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  useEffect(() => {
    load().catch((err) =>
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load content."
      )
    );
  }, []);

  async function uploadAsset(
    file: File,
    protectedFile = false
  ) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "protected",
      protectedFile ? "true" : "false"
    );

    const response = await fetch("/api/admin/files", {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Upload failed.");
    }

    if (!data.file?.id) {
      throw new Error(
        "Upload completed but no database file ID was returned."
      );
    }

    return data.file as {
      id: string;
      name: string;
      mime: string;
      size: number;
      url: string;
    };
  }

  const save = async (type: string, data: any) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("type", type);

      Object.entries(data).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "boolean"
            ? value
              ? "true"
              : "false"
            : String(value ?? "")
        );
      });

      const controller = new AbortController();

      const timeout = window.setTimeout(() => {
        controller.abort();
      }, 30000);

      let response: Response;

      try {
        response = await fetch("/api/admin/content", {
          method: "POST",
          body: formData,
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeout);
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Save failed.");
      }

      if (type === "project" && result.id) {
        setProject((current) => ({
          ...current,
          id: result.id,
        }));
      }

      if (type === "certificate" && result.id) {
        setCertificate((current) => ({
          ...current,
          id: result.id,
        }));
      }

      if (type === "resume" && result.id) {
        setResume((current) => ({
          ...current,
          id: result.id,
        }));
      }

      setMessage(
        result.message || "Saved successfully."
      );

      setBusy(false);

      await load().catch((refreshError) => {
        console.error(
          "Content refresh failed after save:",
          refreshError
        );
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.name === "AbortError"
            ? "Save timed out. Please check the database connection and try again."
            : err.message
          : "Unable to save."
      );

      setBusy(false);
    }
  };

  /*
   * IMPORTANT:
   * Do NOT convert the ID with Number().
   *
   * PostgreSQL IDs may be BIGINT or UUID depending on the
   * existing schema. Converting a UUID to Number() produces
   * NaN and causes the delete request to fail.
   */
  const remove = async (
    type: string,
    id: number | string
  ) => {
    if (!id || String(id).trim() === "") {
      setError("Invalid item ID.");
      return;
    }

    if (!confirm("Delete this item?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/content",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },

          /*
           * FIX:
           * Send the original ID as a string.
           * This safely supports both BIGINT and UUID IDs.
           */
          body: JSON.stringify({
            type,
            id: String(id),
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Delete failed."
        );
      }

      setMessage("Deleted successfully.");

      /*
       * Clear editor if the deleted item is currently open.
       */
      if (
        type === "project" &&
        String(project.id ?? "") === String(id)
      ) {
        setProject({ ...emptyProject });
      }

      if (
        type === "certificate" &&
        String(certificate.id ?? "") === String(id)
      ) {
        setCertificate({ ...emptyCertificate });
      }

      if (
        type === "resume" &&
        String(resume.id ?? "") === String(id)
      ) {
        setResume({ ...emptyResume });
      }

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  };

  const input = (
    label: string,
    value: any,
    setter: (value: string) => void,
    props: any = {}
  ) => (
    <label className="studio-field">
      <span>{label}</span>

      <input
        value={value ?? ""}
        onChange={(event) =>
          setter(event.target.value)
        }
        {...props}
      />
    </label>
  );

  const projectImage =
    project.imageFileId &&
    String(project.imageFileId) !== "NaN"
      ? `/api/files/${encodeURIComponent(
          String(project.imageFileId)
        )}`
      : project.imageUrl ||
        project.image ||
        staticProjectImages[project.slug] ||
        "";

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div>
          <Link
            href="/admin"
            className="studio-back"
          >
            <ArrowLeft size={15} /> Back to Command Center
          </Link>

          <span className="eyebrow">
            CONTENT STUDIO
          </span>

          <h1>
            Portfolio Content Management
          </h1>

          <p>
            Add, update and remove projects,
            certificates and your published CV
            without touching source code.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="studio-preview"
        >
          <Eye size={15} /> View portfolio
        </Link>
      </header>

      <div className="studio-tabs">
        {[
          ["projects", "Projects"],
          ["certificates", "Certificates"],
          ["resume", "Resume / CV"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={
              tab === key ? "active" : ""
            }
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div className="studio-success">
          {message}
        </div>
      )}

      {error && (
        <div className="studio-error">
          {error}
        </div>
      )}

      {/* =====================================================
          PROJECTS
      ====================================================== */}

      {tab === "projects" && (
        <section className="studio-grid">
          <div className="studio-form">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  PROJECT EDITOR
                </span>

                <h2>
                  {project.id
                    ? "Update project"
                    : "Add a new project"}
                </h2>
              </div>

              <button
                onClick={() => {
                  setProject({
                    ...emptyProject,
                  });

                  setMessage("");
                  setError("");
                }}
              >
                <Plus size={15} /> New
              </button>
            </div>

            <div className="studio-fields">
              {input(
                "Project title",
                project.title,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    title: value,
                  }))
              )}

              {input(
                "Slug",
                project.slug,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    slug: value,
                  }))
              )}

              {input(
                "Short title",
                project.shortTitle,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    shortTitle: value,
                  }))
              )}

              {input(
                "Category",
                project.category,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    category: value,
                  }))
              )}

              {input(
                "Description",
                project.description,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    description: value,
                  }))
              )}

              <label className="studio-field studio-full">
                <span>
                  Project overview
                </span>

                <textarea
                  value={
                    project.overview ?? ""
                  }
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      overview:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="studio-field studio-full">
                <span>
                  What I worked on
                </span>

                <textarea
                  value={
                    project.workDone ?? ""
                  }
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      workDone:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="studio-field studio-full">
                <span>
                  Methodology / workflow
                </span>

                <textarea
                  value={
                    project.methodology ?? ""
                  }
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      methodology:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="studio-field studio-full">
                <span>
                  Key insights
                </span>

                <textarea
                  value={
                    project.insights ?? ""
                  }
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      insights:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="studio-field studio-full">
                <span>
                  Outcome
                </span>

                <textarea
                  value={
                    project.outcome ?? ""
                  }
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      outcome:
                        event.target.value,
                    }))
                  }
                />
              </label>

              {input(
                "Technologies (comma separated)",
                Array.isArray(
                  project.technologies
                )
                  ? project.technologies.join(
                      ", "
                    )
                  : project.technologies,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    technologies: value,
                  }))
              )}

              {input(
                "GitHub URL",
                project.githubUrl,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    githubUrl: value,
                  }))
              )}

              {input(
                "Live URL",
                project.liveUrl,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    liveUrl: value,
                  }))
              )}

              {input(
                "Gallery image URLs (comma separated)",
                Array.isArray(project.gallery)
                  ? project.gallery.join(
                      ", "
                    )
                  : project.gallery,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    gallery: value,
                  }))
              )}

              {input(
                "Sort order",
                project.sortOrder,
                (value) =>
                  setProject((current) => ({
                    ...current,
                    sortOrder: value,
                  })),
                {
                  type: "number",
                }
              )}

              {/* Dashboard image */}

              <label className="studio-field">
                <span>
                  Dashboard image
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={async (event) => {
                    const inputElement =
                      event.currentTarget;

                    const file =
                      inputElement.files?.[0];

                    if (!file) return;

                    try {
                      setBusy(true);
                      setError("");

                      setMessage(
                        "Uploading dashboard image…"
                      );

                      const uploaded =
                        await uploadAsset(
                          file,
                          false
                        );

                      setProject(
                        (current) => ({
                          ...current,
                          image:
                            uploaded.url,
                          imageUrl:
                            uploaded.url,
                          imageFileId:
                            uploaded.id,
                        })
                      );

                      setMessage(
                        "Dashboard image uploaded. Click Update project to publish it."
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Upload failed."
                      );
                    } finally {
                      setBusy(false);

                      inputElement.value =
                        "";
                    }
                  }}
                />

                {projectImage && (
                  <img
                    src={projectImage}
                    alt="Dashboard preview"
                    style={{
                      width: "100%",
                      maxHeight: 190,
                      objectFit: "cover",
                      borderRadius: 10,
                      border:
                        "1px solid rgba(255,255,255,.08)",
                      marginTop: 8,
                    }}
                    onError={(event) => {
                      const fallback =
                        staticProjectImages[
                          project.slug
                        ];

                      if (
                        fallback &&
                        event.currentTarget
                          .src !==
                          window.location.origin +
                            fallback
                      ) {
                        event.currentTarget.src =
                          fallback;
                      } else {
                        event.currentTarget.style.display =
                          "none";
                      }
                    }}
                  />
                )}
              </label>

              {/* Project file */}

              <label className="studio-field">
                <span>
                  Project file (.pbix, .xlsx, .xls, .csv, .zip, PDF…)
                </span>

                <input
                  type="file"
                  onChange={async (event) => {
                    const inputElement =
                      event.currentTarget;

                    const file =
                      inputElement.files?.[0];

                    if (!file) return;

                    try {
                      setBusy(true);
                      setError("");

                      setMessage(
                        "Uploading project file…"
                      );

                      const uploaded =
                        await uploadAsset(
                          file,
                          true
                        );

                      setProject(
                        (current) => ({
                          ...current,
                          projectFileUrl: `/api/files/${uploaded.id}?download=1`,
                          projectFileName:
                            uploaded.name,
                          projectFileType:
                            uploaded.mime,
                          projectFileId:
                            uploaded.id,
                        })
                      );

                      setMessage(
                        "Project file uploaded. Click Update project to save the new file reference."
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Upload failed."
                      );
                    } finally {
                      setBusy(false);

                      inputElement.value =
                        "";
                    }
                  }}
                />

                {project.projectFileName && (
                  <small>
                    <UploadCloud
                      size={12}
                      style={{
                        verticalAlign:
                          "middle",
                      }}
                    />{" "}
                    {project.projectFileName}
                  </small>
                )}
              </label>

              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={Boolean(
                    project.featured
                  )}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      featured:
                        event.target.checked,
                    }))
                  }
                />

                Featured project
              </label>

              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={Boolean(
                    project.published
                  )}
                  onChange={(event) =>
                    setProject((current) => ({
                      ...current,
                      published:
                        event.target.checked,
                    }))
                  }
                />

                Publish on portfolio
              </label>
            </div>

            <button
              className="studio-save"
              disabled={busy}
              onClick={() =>
                save("project", project)
              }
            >
              <Save size={16} />

              {busy
                ? "Working…"
                : project.id
                  ? "Update project"
                  : "Publish project"}
            </button>
          </div>

          <div className="studio-list">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  PUBLISHED WORK
                </span>

                <h2>Projects</h2>
              </div>
            </div>

            {projects.map((item, index) => (
              <div
                className="studio-item"
                key={
                  item.id != null &&
                  String(item.id) !== "NaN"
                    ? String(item.id)
                    : `${item.slug || "project"}-${index}`
                }
              >
                <div>
                  <strong>
                    {item.title}
                  </strong>

                  <span>
                    {item.category} •{" "}
                    {item.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setProject({
                        ...emptyProject,
                        ...item,
                        id: item.id,
                        technologies:
                          toList(
                            item.technologies
                          ).join(", "),
                        gallery:
                          toList(
                            item.gallery
                          ).join(", "),
                      });

                      setTab("projects");
                      setError("");
                      setMessage(
                        `Editing ${item.title}`
                      );
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="danger"
                    onClick={() =>
                      remove(
                        "project",
                        item.id!
                      )
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          CERTIFICATES
      ====================================================== */}

      {tab === "certificates" && (
        <section className="studio-grid">
          <div className="studio-form">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  CREDENTIAL EDITOR
                </span>

                <h2>
                  {certificate.id
                    ? "Update certificate"
                    : "Add certificate"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setCertificate({
                    ...emptyCertificate,
                  })
                }
              >
                <Plus size={15} /> New
              </button>
            </div>

            <div className="studio-fields">
              {input(
                "Certificate title",
                certificate.title,
                (value) =>
                  setCertificate(
                    (current) => ({
                      ...current,
                      title: value,
                    })
                  )
              )}

              {input(
                "Issuer / organization",
                certificate.issuer,
                (value) =>
                  setCertificate(
                    (current) => ({
                      ...current,
                      issuer: value,
                    })
                  )
              )}

              {input(
                "Issue date",
                certificate.issueDate,
                (value) =>
                  setCertificate(
                    (current) => ({
                      ...current,
                      issueDate: value,
                    })
                  )
              )}

              {input(
                "Credential ID",
                certificate.credentialId,
                (value) =>
                  setCertificate(
                    (current) => ({
                      ...current,
                      credentialId: value,
                    })
                  )
              )}

              {input(
                "Credential URL",
                certificate.credentialUrl,
                (value) =>
                  setCertificate(
                    (current) => ({
                      ...current,
                      credentialUrl: value,
                    })
                  )
              )}

              <label className="studio-field studio-full">
                <span>
                  Description
                </span>

                <textarea
                  value={
                    certificate.description ??
                    ""
                  }
                  onChange={(event) =>
                    setCertificate(
                      (current) => ({
                        ...current,
                        description:
                          event.target.value,
                      })
                    )
                  }
                />
              </label>

              {/* Certificate image */}

              <label className="studio-field">
                <span>
                  Certificate image
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const inputElement =
                      event.currentTarget;

                    const file =
                      inputElement.files?.[0];

                    if (!file) return;

                    try {
                      setBusy(true);
                      setError("");

                      const uploaded =
                        await uploadAsset(
                          file,
                          false
                        );

                      setCertificate(
                        (current) => ({
                          ...current,
                          imageUrl:
                            uploaded.url,
                          imageFileId:
                            uploaded.id,
                        })
                      );

                      setMessage(
                        "Certificate image uploaded. Save the certificate to publish it."
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Upload failed."
                      );
                    } finally {
                      setBusy(false);

                      inputElement.value =
                        "";
                    }
                  }}
                />

                {certificate.imageFileId && (
                  <img
                    src={`/api/files/${encodeURIComponent(
                      String(
                        certificate.imageFileId
                      )
                    )}`}
                    alt="Certificate preview"
                    style={{
                      width: "100%",
                      maxHeight: 180,
                      objectFit: "contain",
                      borderRadius: 10,
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}
              </label>

              {/* Certificate PDF/file */}

              <label className="studio-field">
                <span>
                  Certificate PDF / file
                </span>

                <input
                  type="file"
                  onChange={async (event) => {
                    const inputElement =
                      event.currentTarget;

                    const file =
                      inputElement.files?.[0];

                    if (!file) return;

                    try {
                      setBusy(true);
                      setError("");

                      const uploaded =
                        await uploadAsset(
                          file,
                          false
                        );

                      setCertificate(
                        (current) => ({
                          ...current,
                          fileUrl: `/api/files/${uploaded.id}?download=1`,
                          fileId:
                            uploaded.id,
                        })
                      );

                      setMessage(
                        "Certificate file uploaded. Save the certificate to publish it."
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Upload failed."
                      );
                    } finally {
                      setBusy(false);

                      inputElement.value =
                        "";
                    }
                  }}
                />
              </label>

              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={Boolean(
                    certificate.published
                  )}
                  onChange={(event) =>
                    setCertificate(
                      (current) => ({
                        ...current,
                        published:
                          event.target.checked,
                      })
                    )
                  }
                />

                Publish certificate
              </label>
            </div>

            <button
              className="studio-save"
              disabled={busy}
              onClick={() =>
                save(
                  "certificate",
                  certificate
                )
              }
            >
              <Save size={16} />

              {busy
                ? "Working…"
                : "Save certificate"}
            </button>
          </div>

          <div className="studio-list">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  CREDENTIAL LIBRARY
                </span>

                <h2>Certificates</h2>
              </div>
            </div>

            {certificates.map(
              (item, index) => (
                <div
                  className="studio-item"
                  key={
                    item.id != null &&
                    String(item.id) !== "NaN"
                      ? String(item.id)
                      : `${item.title || "certificate"}-${index}`
                  }
                >
                  <div>
                    <strong>
                      {item.title}
                    </strong>

                    <span>
                      {item.issuer ||
                        "Credential"}{" "}
                      •{" "}
                      {item.published
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        setCertificate(
                          item
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        remove(
                          "certificate",
                          item.id!
                        )
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* =====================================================
          RESUME / CV
      ====================================================== */}

      {tab === "resume" && (
        <section className="studio-grid">
          <div className="studio-form">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  CV CONTROL
                </span>

                <h2>
                  {resume.id
                    ? "Update resume"
                    : "Publish a resume"}
                </h2>
              </div>

              <button
                onClick={() =>
                  setResume({
                    ...emptyResume,
                  })
                }
              >
                <Plus size={15} /> New
              </button>
            </div>

            <div className="studio-fields">
              {input(
                "Resume title",
                resume.title,
                (value) =>
                  setResume((current) => ({
                    ...current,
                    title: value,
                  }))
              )}

              {input(
                "Version",
                resume.version,
                (value) =>
                  setResume((current) => ({
                    ...current,
                    version: value,
                  }))
              )}

              <label className="studio-field studio-full">
                <span>
                  Description
                </span>

                <textarea
                  value={
                    resume.description ?? ""
                  }
                  onChange={(event) =>
                    setResume((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="studio-field studio-full">
                <span>
                  Upload PDF
                </span>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={async (event) => {
                    const inputElement =
                      event.currentTarget;

                    const file =
                      inputElement.files?.[0];

                    if (!file) return;

                    try {
                      setBusy(true);
                      setError("");

                      const uploaded =
                        await uploadAsset(
                          file,
                          false
                        );

                      /*
                       * Keep the normal file ID.
                       * The server will maintain the
                       * database reference.
                       */
                      setResume(
                        (current) => ({
                          ...current,
                          fileUrl: `/api/files/${uploaded.id}`,
                          fileName:
                            uploaded.name,
                          fileId:
                            uploaded.id,
                        })
                      );

                      setMessage(
                        "Resume uploaded. Save the resume to publish it."
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Upload failed."
                      );
                    } finally {
                      setBusy(false);

                      inputElement.value =
                        "";
                    }
                  }}
                />

                {resume.fileName && (
                  <small>
                    {resume.fileName}
                  </small>
                )}
              </label>

              <label className="studio-check">
                <input
                  type="checkbox"
                  checked={Boolean(
                    resume.published
                  )}
                  onChange={(event) =>
                    setResume((current) => ({
                      ...current,
                      published:
                        event.target.checked,
                    }))
                  }
                />

                Set as current published resume
              </label>
            </div>

            <button
              className="studio-save"
              disabled={busy}
              onClick={() =>
                save("resume", resume)
              }
            >
              <Save size={16} />

              {busy
                ? "Working…"
                : "Publish resume"}
            </button>
          </div>

          <div className="studio-list">
            <div className="studio-form-head">
              <div>
                <span className="eyebrow">
                  CV LIBRARY
                </span>

                <h2>
                  Resume versions
                </h2>
              </div>
            </div>

            {resumes.map(
              (item, index) => {
                /*
                 * For VIEW/OPEN:
                 * Always remove ?download=1.
                 *
                 * This makes the browser open the PDF
                 * instead of forcing a download.
                 */
                const resumeViewUrl =
                  item.fileId != null &&
                  String(item.fileId) !== "" &&
                  String(item.fileId) !==
                    "NaN"
                    ? `/api/files/${encodeURIComponent(
                        String(item.fileId)
                      )}`
                    : item.fileUrl
                        ? item.fileUrl.replace(
                            /([?&])download=1\b/,
                            "$1"
                          ).replace(
                            /[?&]$/,
                            ""
                          )
                        : "";

                return (
                  <div
                    className="studio-item"
                    key={
                      item.id != null &&
                      String(item.id) !==
                        "NaN"
                        ? String(item.id)
                        : `${item.title || "resume"}-${index}`
                    }
                  >
                    <div>
                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.version ||
                          "Version"}{" "}
                        •{" "}
                        {item.published
                          ? "CURRENT"
                          : "Archived"}
                      </span>
                    </div>

                    <div>
                      {resumeViewUrl && (
                        <a
                          href={
                            resumeViewUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      )}

                      <button
                        onClick={() =>
                          setResume(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger"
                        onClick={() =>
                          remove(
                            "resume",
                            item.id!
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}
    </main>
  );
}