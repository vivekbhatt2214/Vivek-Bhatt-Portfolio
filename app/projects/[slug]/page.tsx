import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import VisitorTracker from "@/components/AnalyticsTracker";
import DownloadProjectButton from "@/components/DownloadProjectButton";
import { getProjectBySlug } from "@/lib/projects";

export const dynamic = "force-dynamic";

function parseArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);

  try {
    const x = JSON.parse(value || "[]");
    return Array.isArray(x) ? x.map(String) : [];
  } catch {
    return String(value || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const tech = parseArray(project.technologies);
  const gallery = parseArray(project.gallery);

  const staticImages: Record<string, string> = {
    "swiggy-sales-dashboard": "/projects/swiggy.png",
    "hr-analytics-dashboard": "/projects/hr.png",
    "blinkit-sales-dashboard": "/projects/blinkit.png",
    "starbucks-analytics-dashboard": "/projects/starbucks-dashboard.png",
    "phonepe-transaction-analytics-dashboard": "/projects/phonepe.png",
  };

  const imageUrl = project.imageFileId
    ? `/api/files/${project.imageFileId}`
    : project.image || staticImages[project.slug] || null;

  return (
    <>
      <VisitorTracker />

      <Navbar />

      <main className="project-detail compact-case-study">
        <div className="detail-nav">
          <Link href="/portfolio#projects" className="back-link">
            ← Back to projects
          </Link>

          <span>{project.category}</span>
        </div>

        <section className="detail-hero">
          <div>
            <p className="eyebrow">CASE STUDY</p>

            <h1>{project.title}</h1>

            <p className="detail-lead">{project.description}</p>

            <div className="detail-tech hero-tech">
              {tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>

            <div className="detail-actions">
              {project.liveUrl && (
                <a
                  className="btn btn-primary"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View live project <ArrowUpRight size={17} />
                </a>
              )}

              {project.githubUrl && (
                <a
                  className="btn btn-ghost"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={17} /> GitHub
                </a>
              )}

              <DownloadProjectButton
                slug={project.slug}
                title={project.title}
              />
            </div>
          </div>

          <div className="detail-visual">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${project.title} dashboard`}
              />
            ) : (
              <div className="project-media-fallback">
                <span>Dashboard Preview</span>
              </div>
            )}
          </div>
        </section>

        <div className="case-study-flow">
          {project.overview && (
            <section className="case-study-section">
              <div className="case-study-heading">
                <p className="eyebrow">PROJECT CONTEXT</p>
                <h2>What problem was being solved?</h2>
              </div>

              <div className="case-study-text">
                <p>{project.overview}</p>
              </div>
            </section>
          )}

          {project.workDone && (
            <section className="case-study-section case-study-dark">
              <div className="case-study-heading">
                <p className="eyebrow">MY CONTRIBUTION</p>
                <h2>What I worked on</h2>
              </div>

              <div className="case-study-text">
                <p>{project.workDone}</p>
              </div>
            </section>
          )}

          {project.methodology && (
            <section className="case-study-section">
              <div className="case-study-heading">
                <p className="eyebrow">WORKFLOW</p>
                <h2>How I approached the analysis</h2>
              </div>

              <div className="case-study-text">
                <p>{project.methodology}</p>
              </div>
            </section>
          )}

          {tech.length > 0 && (
            <section className="case-study-section case-study-dark">
              <div className="case-study-heading">
                <p className="eyebrow">TOOLKIT</p>
                <h2>Technology & analytical stack</h2>
              </div>

              <div className="detail-tech large-tech">
                {tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </section>
          )}

          <section className="project-preview-section">
            <div className="project-preview-heading">
              <p className="eyebrow">VISUAL ANALYSIS</p>

              <h2>Dashboard & analysis</h2>

              <p>
                The dashboard is presented as the visual output of the analysis
                workflow.
              </p>
            </div>

            <div className="project-preview-image">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${project.title} preview`}
                />
              ) : (
                <div className="project-media-fallback">
                  <span>Dashboard Preview</span>
                </div>
              )}
            </div>
          </section>

          {gallery.length > 0 && (
            <section className="case-study-section">
              <div className="case-study-heading">
                <p className="eyebrow">PROJECT GALLERY</p>
                <h2>Supporting visuals</h2>
              </div>

              <div className="project-gallery">
                {gallery.map((image, i) => (
                  <div
                    className="gallery-item"
                    key={`${image}-${i}`}
                  >
                    <img
                      src={image}
                      alt={`${project.title} screenshot ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.insights && (
            <section className="case-study-section case-study-dark">
              <div className="case-study-heading">
                <p className="eyebrow">KEY INSIGHTS</p>
                <h2>What the analysis revealed</h2>
              </div>

              <div className="case-study-text">
                <p>{project.insights}</p>
              </div>
            </section>
          )}

          {project.outcome && (
            <section className="case-study-section">
              <div className="case-study-heading">
                <p className="eyebrow">OUTCOME</p>
                <h2>What the work delivers</h2>
              </div>

              <div className="case-study-text">
                <p>{project.outcome}</p>
              </div>
            </section>
          )}
        </div>

        <section className="project-final-cta">
          <p className="eyebrow">KEEP EXPLORING</p>

          <h2>Want to see another project?</h2>

          <p>
            Return directly to the Projects section instead of the welcome
            page.
          </p>

          <Link
            href="/portfolio#projects"
            className="btn btn-primary"
          >
            Back to projects <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}