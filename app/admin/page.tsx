"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Github,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
import CustomCursor from "@/components/extras/CustomCursor";

type Analytics = {
  totalVisitors: number;
  pageViews: number;
  activeNow: number;
  totalEvents: number;
  resumeViews: number;
  resumeDownloads: number;
  projectClicks: number;
  githubClicks: number;
  liveProjectClicks: number;
  interviewClicks: number;
  contacts: number;
  verifiedContacts: number;
  daily?: Array<{
    label: string;
    events: number;
    visitors: number;
    page_views: number;
    projects: number;
    resume: number;
    github: number;
    contacts: number;
  }>;
  activity?: Array<{
    event_type: string;
    session_id: string;
    page_path: string;
    metadata: any;
    created_at: string;
  }>;
};

type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
};

const zeroAnalytics: Analytics = {
  totalVisitors: 0,
  pageViews: 0,
  activeNow: 0,
  totalEvents: 0,
  resumeViews: 0,
  resumeDownloads: 0,
  projectClicks: 0,
  githubClicks: 0,
  liveProjectClicks: 0,
  interviewClicks: 0,
  contacts: 0,
  verifiedContacts: 0,
  daily: [],
  activity: [],
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>(zeroAnalytics);
  const [projects, setProjects] = useState<Project[]>([]);
  const [time, setTime] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          window.location.replace("/admin/login");
          return;
        }
        if (mounted) setLoading(false);
      })
      .catch(() => {
        window.location.replace("/admin/login");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = useCallback(async () => {
    setAnalyticsLoading(true);

    try {
      const [analyticsResponse, contentResponse] = await Promise.all([
        fetch("/api/admin/analytics", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        }),
        fetch("/api/admin/content", { cache: "no-store" }),
      ]);

      if (analyticsResponse.ok) {
        const payload = await analyticsResponse.json();
        const source = payload?.data ?? payload ?? {};

        setAnalytics({
          totalVisitors: Number(source.totalVisitors ?? 0),
          pageViews: Number(source.pageViews ?? 0),
          activeNow: Number(source.activeNow ?? 0),
          totalEvents: Number(source.totalEvents ?? 0),
          resumeViews: Number(source.resumeViews ?? 0),
          resumeDownloads: Number(source.resumeDownloads ?? 0),
          projectClicks: Number(source.projectClicks ?? 0),
          githubClicks: Number(source.githubClicks ?? 0),
          liveProjectClicks: Number(source.liveProjectClicks ?? 0),
          interviewClicks: Number(source.interviewClicks ?? 0),
          contacts: Number(source.contacts ?? 0),
          verifiedContacts: Number(source.verifiedContacts ?? 0),
          daily: Array.isArray(source.daily)
            ? source.daily.map((item: any) => ({
                label: String(item.label ?? ""),
                events: Number(item.events ?? 0),
                visitors: Number(item.visitors ?? 0),
                page_views: Number(item.page_views ?? 0),
                projects: Number(item.projects ?? 0),
                resume: Number(item.resume ?? 0),
                github: Number(item.github ?? 0),
                contacts: Number(item.contacts ?? 0),
              }))
            : [],
          activity: Array.isArray(source.activity) ? source.activity : [],
        });
      } else {
        setAnalytics(zeroAnalytics);
      }

      if (contentResponse.ok) {
        const content = await contentResponse.json();
        setProjects(Array.isArray(content?.projects) ? content.projects : []);
      }
    } catch (error) {
      console.error("Admin dashboard load error:", error);
    } finally {
      setAnalyticsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) loadDashboard();
  }, [loading, loadDashboard]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [loading, loadDashboard]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.replace("/admin/login");
    }
  }

  if (loading) {
    return (
      <main className="admin-loading">
        <div className="admin-loader">
          <div className="admin-loader-logo">VB</div>
          <div className="admin-spinner" />
          <strong>Admin Workspace</strong>
          <span>Checking secure session...</span>
        </div>
      </main>
    );
  }

  const compactStats = [
    ["RESUME VIEWS", analytics.resumeViews, "Resume interactions", FileText, "cyan"],
    ["RESUME DOWNLOADS", analytics.resumeDownloads, "Downloaded resumes", Download, "purple"],
    ["PROJECT CLICKS", analytics.projectClicks, "Project interactions", FolderKanban, "green"],
    ["GITHUB CLICKS", analytics.githubClicks, "GitHub interactions", Github, "orange"],
    ["LIVE PROJECT CLICKS", analytics.liveProjectClicks, "Live project clicks", ArrowUpRight, "cyan"],
    ["INTERVIEW REQUESTS", analytics.interviewClicks, "Interview requests", MessageSquare, "purple"],
    ["CONTACTS", analytics.contacts, "Contact submissions", Mail, "green"],
    ["VERIFIED CONTACTS", analytics.verifiedContacts, "Verified contacts", ShieldCheck, "orange"],
  ] as const;

  const daily = analytics.daily ?? [];
  const mainStats = [
    ["TOTAL VISITORS", analytics.totalVisitors, "Unique sessions", Users, "cyan", daily.map((d) => d.visitors)],
    ["PAGE VIEWS", analytics.pageViews, "Portfolio views", Eye, "purple", daily.map((d) => d.page_views)],
    ["ACTIVE NOW", analytics.activeNow, "Last 5 minutes", Activity, "green", daily.map((d) => d.visitors)],
    ["TOTAL EVENTS", analytics.totalEvents, "Tracked events", Sparkles, "orange", daily.map((d) => d.events)],
  ] as const;

  return (
    <>
      <CustomCursor />
      <AdminNavbar />

      <main className="admin-dashboard-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <div className="admin-sidebar-logo">VB</div>
            <div>
              <strong>Vivek Bhatt</strong>
              <span>ADMIN PANEL</span>
            </div>
          </div>

          <div className="admin-command-label">COMMAND CENTER</div>

          <nav className="admin-side-nav">
            <SideLink href="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
            <SideLink href="/admin/manage" icon={<FolderKanban size={18} />} label="Projects" />
            <SideLink href="/admin/manage" icon={<BarChart3 size={18} />} label="Skills" />
            <SideLink href="/admin/manage" icon={<BookOpen size={18} />} label="Certifications" />
            <SideLink href="/admin/activity?view=messages" icon={<Mail size={18} />} label="Contact Messages" />
            <SideLink href="/admin/activity?view=interviews" icon={<MessageSquare size={18} />} label="Interview Requests" />
            <SideLink href="/admin/manage" icon={<Sparkles size={18} />} label="Content Studio" />
            <SideLink href="/admin/activity?view=downloads" icon={<Download size={18} />} label="Downloads" />
            <SideLink href="/admin/activity?view=calls" icon={<Phone size={18} />} label="Call Requests" />
          </nav>

          <div className="admin-sidebar-bottom">
            <div className="admin-system-card">
              <div className="system-online">
                <span />
                SYSTEM ONLINE
              </div>
              <small>Analytics API connected</small>
              <Activity className="system-wave" size={30} />
            </div>

            <div className="admin-profile-card">
              <div className="mini-vb">VB</div>
              <div>
                <strong>Vivek Bhatt</strong>
                <span>Data Analyst &amp; Developer</span>
              </div>
              <i />
            </div>

            <button
              className="admin-logout"
              onClick={logout}
              disabled={loggingOut}
            >
              <X size={16} />
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </aside>

        <section className="admin-main">
          <header className="admin-header">
            <div>
              <div className="admin-eyebrow">PRIVATE WORKSPACE</div>
              <h1>Welcome back, Vivek. <span>👋</span></h1>
              <p>Real-time portfolio analytics and visitor intelligence.</p>
            </div>

            <div className="admin-header-actions">
              <span className="admin-time">
                <BookOpen size={14} />
                {time}
              </span>
              <button
                className="admin-refresh"
                onClick={() => {
                  setRefreshing(true);
                  loadDashboard();
                }}
                disabled={refreshing}
              >
                <RefreshCw size={14} className={refreshing ? "spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <Link href="/portfolio" className="admin-view-portfolio">
                View Portfolio <ArrowUpRight size={16} />
              </Link>
            </div>
          </header>

          <div className="admin-status-bar">
            <div>
              <span className="status-pulse" />
              <strong>ANALYTICS LIVE</strong>
              <span>
                {analyticsLoading ? "Loading analytics..." : "Everything looks good. Data is up to date."}
              </span>
            </div>
            <small>Auto refresh in 30 sec ⏱</small>
          </div>

          <section className="main-stat-grid">
            {mainStats.map(([label, value, description, Icon, tone, series]) => (
              <MainStat
                key={label}
                label={label}
                value={value}
                description={description}
                Icon={Icon}
                tone={tone}
                series={series}
              />
            ))}
          </section>

          <section className="compact-stat-grid">
            {compactStats.map(([label, value, description, Icon, tone]) => (
              <CompactStat
                key={label}
                label={label}
                value={value}
                description={description}
                Icon={Icon}
                tone={tone}
              />
            ))}
          </section>

          <section className="admin-insight-grid">
            <div className="admin-panel activity-panel">
              <div className="panel-heading">
                <div>
                  <div className="admin-eyebrow">VISITOR INTELLIGENCE</div>
                  <h2>Portfolio Activity Overview</h2>
                </div>
                <select defaultValue="week" aria-label="Activity range">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <DashboardChart analytics={analytics} />
            </div>

            <div className="admin-panel engagement-panel">
              <div className="admin-eyebrow">EVENT INTELLIGENCE</div>
              <h2>Engagement Overview</h2>

              <div className="engagement-list">
                <EngagementRow icon={<Zap />} label="Live Projects" value={analytics.liveProjectClicks} />
                <EngagementRow icon={<Users />} label="Interview Requests" value={analytics.interviewClicks} />
                <EngagementRow icon={<Mail />} label="Contacts" value={analytics.contacts} />
                <EngagementRow icon={<ShieldCheck />} label="Verified Contacts" value={analytics.verifiedContacts} />
              </div>
            </div>

            <div className="admin-panel quick-actions-panel">
              <div className="admin-eyebrow">QUICK ACTIONS</div>
              <div className="quick-action-grid">
                <QuickAction href="/admin/manage" icon={<FolderKanban />} title="Projects" subtitle="View all projects" />
                <QuickAction href="/admin/manage" icon={<ShieldCheck />} title="Certificates" subtitle="View certificates" />
                <QuickAction href="/admin/activity" icon={<Mail />} title="Contacts" subtitle="View messages" />
                <QuickAction href="/portfolio" icon={<ArrowUpRight />} title="Portfolio" subtitle="Open portfolio" />
              </div>
            </div>
          </section>

          <section className="admin-panel selected-work-panel">
            <div className="selected-work-head">
              <div>
                <div className="admin-eyebrow">SELECTED WORK</div>
                <h2>Portfolio Projects</h2>
              </div>
              <Link href="/admin/manage">
                View all projects <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="selected-projects">
              {projects.slice(0, 5).map((project) => (
                <Link key={project.id} href={`/projects/${project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="selected-project">
                  <div className="selected-project-icon">
                    {project.category.toLowerCase().includes("power") ? (
                      <BarChart3 size={20} />
                    ) : (
                      <FileSpreadsheet size={20} />
                    )}
                  </div>
                  <div>
                    <strong>{project.title}</strong>
                    <span>{project.category}</span>
                  </div>
                  <ArrowUpRight className="selected-project-arrow" size={17} />
                </Link>
              ))}

              {!projects.length && (
                <div className="empty-projects">
                  No projects yet. Add your first project from Content Studio.
                </div>
              )}
            </div>
          </section>

          <section className="admin-panel recent-panel">
            <div className="selected-work-head">
              <div>
                <div className="admin-eyebrow">LIVE VISITOR INTELLIGENCE</div>
                <h2>Recent visitor actions</h2>
              </div>
              <span className="live-label">● LIVE • 30 SEC REFRESH</span>
            </div>

            <div className="recent-list">
              {(analytics.activity ?? []).slice(0, 8).map((item, index) => {
                const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
                const label = String(metadata.projectTitle || metadata.label || metadata.section || item.page_path || "Portfolio");

                return (
                  <div className="recent-row" key={`${item.session_id}-${item.created_at}-${index}`}>
                    <span className="recent-dot" />
                    <div>
                      <strong>{String(item.event_type).replaceAll("_", " ")}</strong>
                      <small>{label}</small>
                    </div>
                    <time>
                      {new Date(item.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                );
              })}

              {!analytics.activity?.length && (
                <div className="empty-recent">
                  No visitor activity yet. Open the public portfolio in another tab to see live events here.
                </div>
              )}
            </div>
          </section>

          <footer className="admin-footer">
            <span>© 2026 Vivek Bhatt</span>
            <span>Data Analyst • Developer</span>
            <span><ShieldCheck size={12} /> Private Admin Workspace</span>
          </footer>
        </section>
      </main>
      
      <style jsx>{`
        .admin-loading {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #050816;
          color: #fff;
          font-family: Arial, sans-serif;
        }
        .admin-loader { text-align: center; display: grid; gap: 10px; place-items: center; }
        .admin-loader-logo {
          width: 68px; height: 68px; border-radius: 18px; display:grid; place-items:center;
          color:#00e5ff; border:1px solid rgba(0,229,255,.45); background:rgba(0,229,255,.05);
          box-shadow:0 0 35px rgba(0,229,255,.12); font-weight:900; font-size:22px;
        }
        .admin-loader span { color:rgba(255,255,255,.35); font-size:12px; }
        .admin-spinner { width:22px; height:22px; border:2px solid rgba(255,255,255,.1); border-top-color:#00e5ff; border-radius:50%; animation:admin-spin .8s linear infinite; }
        @keyframes admin-spin { to { transform:rotate(360deg); } }

        .admin-topbar {
          position:fixed; top:0; left:0; right:0; height:72px; z-index:100;
          background:rgba(5,8,22,.94); border-bottom:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(20px);
        }
        .admin-topbar-inner {
          height:100%; padding:0 42px 0 24px; display:flex; align-items:center;
          justify-content:space-between; gap:28px;
        }
        .admin-top-brand { display:flex; align-items:center; gap:12px; min-width:255px; color:#fff; }
        .admin-top-mark {
          width:44px; height:44px; display:grid; place-items:center; border-radius:13px;
          border:1px solid rgba(0,229,255,.65); color:#00e5ff; background:rgba(0,229,255,.06);
          box-shadow:0 0 22px rgba(0,229,255,.08); font-weight:900;
        }
        .admin-top-copy { display:grid; gap:3px; }
        .admin-top-copy strong { font:700 16px/1 "Space Grotesk",Arial,sans-serif; }
        .admin-top-copy small { color:#8794a9; font-size:10px; letter-spacing:.08em; }
        .admin-top-links { display:flex; align-items:center; justify-content:flex-end; gap:30px; }
        .admin-top-links a { color:#b3bfce; font-size:12px; text-decoration:none; transition:.2s; white-space:nowrap; }
        .admin-top-links a:hover { color:#fff; }
        .admin-top-links .admin-top-cta {
          display:inline-flex; align-items:center; gap:8px; padding:11px 17px; border-radius:10px;
          background:#08bfe7; color:#041018; font-weight:800; box-shadow:0 8px 25px rgba(0,229,255,.14);
        }
        .cta-bubble { font-size:14px; line-height:1; }
        .admin-top-menu { display:none; border:0; background:transparent; color:#fff; cursor:pointer; }

        .admin-dashboard-shell {
          min-height:100vh; display:flex; padding-top:72px; color:#f7fbff;
          background:
            radial-gradient(circle at 74% 5%, rgba(0,229,255,.08), transparent 25%),
            radial-gradient(circle at 15% 85%, rgba(139,92,246,.07), transparent 27%),
            #050816;
          font-family:"DM Sans",Arial,sans-serif;
        }
        .admin-dashboard-shell:before {
          content:""; position:fixed; inset:72px 0 0; pointer-events:none; z-index:0;
          background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px);
          background-size:58px 58px; mask-image:linear-gradient(to bottom,black,transparent 85%);
        }

        .admin-sidebar {
          position:fixed; left:0; top:72px; bottom:0; width:263px; z-index:40;
          padding:34px 22px 20px; border-right:1px solid rgba(255,255,255,.08);
          background:rgba(5,8,22,.9); backdrop-filter:blur(18px);
          display:flex; flex-direction:column;
        }
        .admin-sidebar-brand { display:flex; align-items:center; gap:12px; padding:0 2px; margin-bottom:48px; }
        .admin-sidebar-logo {
          width:42px; height:42px; border-radius:12px; display:grid; place-items:center;
          border:1px solid rgba(0,229,255,.65); color:#00e5ff; font-weight:900;
          box-shadow:0 0 22px rgba(0,229,255,.08);
        }
        .admin-sidebar-brand strong { display:block; font:700 16px/1.2 "Space Grotesk",Arial,sans-serif; }
        .admin-sidebar-brand span { display:block; margin-top:4px; color:#5f6d80; font-size:9px; letter-spacing:.14em; }
        .admin-command-label { color:#69768a; font-size:9px; letter-spacing:.2em; font-weight:800; margin:0 4px 13px; }
        .admin-side-nav { display:grid; gap:4px; }
        .admin-side-link {
          min-height:45px; display:flex; align-items:center; gap:12px; padding:0 12px; border-radius:10px;
          color:#d1d9e5; text-decoration:none; font-size:13px; transition:.2s; position:relative;
        }
        .admin-side-link > span { width:22px; display:grid; place-items:center; color:#cbd4e0; }
        .admin-side-link .side-arrow { margin-left:auto; color:transparent; transition:.2s; }
        .admin-side-link:hover, .admin-side-link.active {
          color:#fff; background:linear-gradient(90deg,rgba(0,229,255,.13),rgba(0,229,255,.025));
          box-shadow:inset 2px 0 #00e5ff;
        }
        .admin-side-link.active > span { color:#00e5ff; }
        .admin-side-link:hover .side-arrow, .admin-side-link.active .side-arrow { color:#607084; }

        .admin-sidebar-bottom { margin-top:auto; }
        .admin-system-card {
          position:relative; padding:15px 14px; border-radius:11px; border:1px solid rgba(34,197,94,.2);
          background:rgba(34,197,94,.035); margin-bottom:11px; overflow:hidden;
        }
        .system-online { color:#22c55e; font-size:9px; font-weight:800; letter-spacing:.12em; }
        .system-online span { display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:7px; background:#22c55e; box-shadow:0 0 10px #22c55e; }
        .admin-system-card small { display:block; color:#718095; font-size:9px; margin-top:6px; }
        .system-wave { position:absolute; right:9px; bottom:9px; color:#22c55e; opacity:.8; }
        .admin-profile-card {
          min-height:67px; display:flex; align-items:center; gap:10px; padding:12px;
          border:1px solid rgba(255,255,255,.09); border-radius:11px; background:rgba(255,255,255,.02); margin-bottom:11px;
        }
        .mini-vb { width:35px; height:35px; border-radius:50%; display:grid; place-items:center; background:rgba(0,229,255,.06); color:#00e5ff; border:1px solid rgba(0,229,255,.16); font-size:11px; font-weight:900; }
        .admin-profile-card div:nth-child(2) { min-width:0; }
        .admin-profile-card strong { display:block; font-size:11px; }
        .admin-profile-card span { display:block; margin-top:4px; color:#718095; font-size:8px; }
        .admin-profile-card i { width:6px; height:6px; border-radius:50%; background:#22c55e; margin-left:auto; align-self:flex-start; }
        .admin-logout {
          width:100%; min-height:42px; display:flex; align-items:center; justify-content:center; gap:8px;
          border:1px solid rgba(239,68,68,.28); border-radius:10px; color:#ff7272; background:rgba(239,68,68,.025);
          cursor:pointer; font-size:11px; transition:.2s;
        }
        .admin-logout:hover { background:rgba(239,68,68,.08); border-color:rgba(239,68,68,.45); }

        .admin-main {
          position:relative; z-index:1; width:calc(100% - 263px); margin-left:263px; padding:38px 49px 24px;
          min-width:0;
        }
        .admin-header { display:flex; align-items:flex-start; justify-content:space-between; gap:28px; margin-bottom:21px; }
        .admin-eyebrow { color:#00e5ff; font-size:9px; font-weight:900; letter-spacing:.18em; }
        .admin-header h1 { margin:8px 0 6px; font:700 30px/1.1 "Space Grotesk",Arial,sans-serif; letter-spacing:-.035em; }
        .admin-header h1 span { font-size:25px; }
        .admin-header p { margin:0; color:#7d8ba0; font-size:11px; }
        .admin-header-actions { display:flex; align-items:center; gap:10px; }
        .admin-time, .admin-refresh {
          min-height:38px; display:inline-flex; align-items:center; gap:7px; padding:0 13px; border-radius:10px;
          border:1px solid rgba(255,255,255,.09); background:rgba(255,255,255,.025); color:#9ba8ba; font-size:10px; white-space:nowrap;
        }
        .admin-refresh { color:#00e5ff; cursor:pointer; }
        .admin-refresh:disabled { opacity:.6; cursor:wait; }
        .admin-view-portfolio {
          min-height:40px; display:inline-flex; align-items:center; gap:7px; padding:0 18px; border-radius:10px;
          color:#041018; background:linear-gradient(100deg,#00e5ff,#7b63ff); font-size:10px; font-weight:900; text-decoration:none;
          box-shadow:0 8px 30px rgba(0,229,255,.12);
        }
        .spin { animation:admin-spin .8s linear infinite; }

        .admin-status-bar {
          min-height:35px; display:flex; align-items:center; justify-content:space-between; gap:15px;
          padding:0 15px; margin-bottom:17px; border:1px solid rgba(245,158,11,.25); border-radius:10px;
          background:linear-gradient(90deg,rgba(245,158,11,.045),rgba(0,229,255,.02));
        }
        .admin-status-bar > div { display:flex; align-items:center; gap:9px; font-size:9px; }
        .admin-status-bar strong { color:#f59e0b; letter-spacing:.12em; }
        .admin-status-bar > div > span:last-child { color:#8794a9; }
        .status-pulse { width:6px; height:6px; border-radius:50%; background:#f59e0b; box-shadow:0 0 10px rgba(245,158,11,.7); }
        .admin-status-bar small { color:#6e7b8f; font-size:8px; }

        .main-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; margin-bottom:13px; }
        .main-stat {
          position:relative; min-height:126px; overflow:hidden; padding:15px 16px 0; border-radius:12px;
          border:1px solid rgba(255,255,255,.09); background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.015));
        }
        .main-stat:hover { transform:translateY(-1px); border-color:rgba(0,229,255,.2); }
        .main-stat-top { display:flex; align-items:center; gap:10px; }
        .main-stat-icon { width:36px; height:36px; border-radius:50%; display:grid; place-items:center; background:rgba(0,229,255,.08); }
        .main-stat strong { display:block; margin-top:7px; font:800 25px/1 "Space Grotesk",Arial,sans-serif; }
        .main-stat > span { display:block; margin-top:5px; color:#718095; font-size:9px; }
        .main-stat.cyan .main-stat-icon { color:#00e5ff; background:rgba(0,229,255,.09); }
        .main-stat.purple .main-stat-icon { color:#a78bfa; background:rgba(139,92,246,.11); }
        .main-stat.green .main-stat-icon { color:#22c55e; background:rgba(34,197,94,.11); }
        .main-stat.orange .main-stat-icon { color:#f59e0b; background:rgba(245,158,11,.11); }
        .main-stat .sparkline { position:absolute; left:14px; right:14px; bottom:7px; width:calc(100% - 28px); height:33px; opacity:.9; }
        .main-stat .sparkline polyline { stroke:#00e5ff; stroke-width:1.6; }
        .main-stat.purple .sparkline polyline { stroke:#8b5cf6; }
        .main-stat.green .sparkline polyline { stroke:#22c55e; }
        .main-stat.orange .sparkline polyline { stroke:#f59e0b; }

        .compact-stat-grid { display:grid; grid-template-columns:repeat(8,1fr); gap:9px; margin-bottom:15px; }
        .compact-stat {
          min-width:0; min-height:83px; display:flex; gap:8px; align-items:flex-start; padding:12px 10px;
          border:1px solid rgba(255,255,255,.08); border-radius:11px; background:rgba(255,255,255,.025);
        }
        .compact-icon { width:31px; height:31px; flex:0 0 31px; display:grid; place-items:center; border-radius:50%; background:rgba(0,229,255,.07); }
        .compact-copy { min-width:0; }
        .compact-label { color:#9ca8b9; font-size:7px; font-weight:800; line-height:1.05; letter-spacing:.08em; }
        .compact-copy strong { display:block; margin-top:5px; font-size:16px; line-height:1; }
        .compact-copy span { display:block; margin-top:5px; color:#6f7d90; font-size:7px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .compact-stat.cyan .compact-icon { color:#00e5ff; }
        .compact-stat.purple .compact-icon { color:#a78bfa; background:rgba(139,92,246,.1); }
        .compact-stat.green .compact-icon { color:#22c55e; background:rgba(34,197,94,.1); }
        .compact-stat.orange .compact-icon { color:#f59e0b; background:rgba(245,158,11,.1); }

        .admin-insight-grid { display:grid; grid-template-columns:1.42fr .78fr .96fr; gap:13px; margin-bottom:14px; }
        .admin-panel {
          border:1px solid rgba(255,255,255,.08); border-radius:13px; background:linear-gradient(145deg,rgba(255,255,255,.038),rgba(255,255,255,.014));
          box-shadow:0 18px 60px rgba(0,0,0,.12);
        }
        .activity-panel, .engagement-panel, .quick-actions-panel { min-height:191px; padding:17px 18px; }
        .panel-heading, .selected-work-head { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; }
        .panel-heading h2, .selected-work-head h2, .engagement-panel h2 { margin:7px 0 0; font:600 16px/1.2 "Space Grotesk",Arial,sans-serif; }
        .panel-heading select {
          appearance:auto; background:#0b1224; color:#aeb9c8; border:1px solid rgba(255,255,255,.1); border-radius:8px; padding:7px 10px; font-size:9px;
        }

        .overview-chart { position:relative; height:127px; margin-top:12px; }
        .chart-grid-lines { position:absolute; inset:0 0 20px; }
        .chart-grid-lines span { position:absolute; left:0; right:0; border-top:1px solid rgba(255,255,255,.055); }
        .overview-bars { position:absolute; inset:0 0 0; display:grid; grid-template-columns:repeat(7,1fr); align-items:end; gap:14px; padding:0 7px; }
        .overview-bar-wrap { height:100%; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:8px; position:relative; z-index:1; }
        .overview-bar { width:58%; min-height:5px; border-radius:5px 5px 1px 1px; background:linear-gradient(to top,#8b5cf6,#00e5ff); box-shadow:0 0 18px rgba(0,229,255,.08); }
        .overview-bar-wrap span { color:#657388; font-size:7px; white-space:nowrap; }

        .engagement-panel h2 { margin-bottom:7px; }
        .engagement-list { margin-top:7px; }
        .engagement-row { min-height:39px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,.055); }
        .engagement-row:last-child { border-bottom:0; }
        .engagement-row div { display:flex; align-items:center; gap:8px; color:#9da9b9; font-size:9px; }
        .engagement-row div span { width:25px; height:25px; display:grid; place-items:center; border-radius:50%; background:rgba(0,229,255,.07); color:#00e5ff; }
        .engagement-row strong { font-size:11px; }

        .quick-actions-panel > .admin-eyebrow { display:block; margin-bottom:11px; }
        .quick-action-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .quick-action {
          min-height:59px; display:flex; align-items:center; gap:8px; padding:9px; border:1px solid rgba(255,255,255,.08);
          border-radius:9px; color:#fff; text-decoration:none; background:rgba(255,255,255,.02); transition:.2s;
        }
        .quick-action:hover { border-color:rgba(0,229,255,.25); transform:translateY(-1px); }
        .quick-action > span { width:27px; height:27px; flex:0 0 27px; display:grid; place-items:center; border-radius:7px; background:rgba(0,229,255,.07); color:#00e5ff; }
        .quick-action div { min-width:0; flex:1; }
        .quick-action strong { display:block; font-size:9px; }
        .quick-action small { display:block; margin-top:3px; color:#68778b; font-size:7px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .quick-action > svg { color:#708095; }

        .selected-work-panel { padding:16px 18px; margin-bottom:13px; }
        .selected-work-head { align-items:center; margin-bottom:12px; }
        .selected-work-head h2 { font-size:17px; }
        .selected-work-head a { display:flex; align-items:center; gap:5px; color:#00e5ff; font-size:9px; text-decoration:none; }
        .selected-projects { display:grid; grid-template-columns:repeat(5,1fr); gap:9px; }
        .selected-project {
          min-width:0; min-height:66px; display:flex; align-items:center; gap:8px; padding:9px;
          border:1px solid rgba(255,255,255,.08); border-radius:9px; background:rgba(255,255,255,.02);
          color:#fff; text-decoration:none; transition:.2s;
        }
        .selected-project:hover { border-color:rgba(0,229,255,.25); transform:translateY(-1px); }
        .selected-project-icon { width:28px; height:28px; flex:0 0 28px; display:grid; place-items:center; border-radius:6px; background:rgba(0,229,255,.08); color:#00e5ff; }
        .selected-project > div:nth-child(2) { min-width:0; flex:1; }
        .selected-project strong { display:block; font-size:8px; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .selected-project span { display:block; margin-top:4px; color:#68778b; font-size:7px; }
        .selected-project-arrow { color:#7b899c; flex:0 0 auto; }
        .empty-projects { color:#718095; padding:16px; font-size:10px; grid-column:1/-1; }

        .recent-panel { padding:16px 18px; margin-bottom:13px; }
        .live-label { color:#22c55e; font-size:8px; letter-spacing:.08em; }
        .recent-list { display:grid; gap:7px; }
        .recent-row { min-height:48px; display:grid; grid-template-columns:7px 1fr auto; align-items:center; gap:10px; padding:8px 10px; border:1px solid rgba(255,255,255,.055); border-radius:8px; background:rgba(255,255,255,.018); }
        .recent-dot { width:6px; height:6px; border-radius:50%; background:#00e5ff; box-shadow:0 0 10px rgba(0,229,255,.7); }
        .recent-row strong { display:block; font-size:9px; text-transform:capitalize; }
        .recent-row small { display:block; margin-top:3px; color:#69778b; font-size:7px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:500px; }
        .recent-row time { color:#68768a; font-size:8px; }
        .empty-recent { padding:15px 0; color:#6d7b8e; font-size:9px; }

        .admin-footer { display:flex; justify-content:space-between; align-items:center; padding:12px 7px 2px; color:#596779; font-size:8px; border-top:1px solid rgba(255,255,255,.055); }
        .admin-footer span:last-child { display:flex; align-items:center; gap:4px; }

        @media (max-width:1250px) {
          .admin-topbar-inner { padding-right:24px; }
          .admin-top-links { gap:18px; }
          .admin-main { padding-left:30px; padding-right:30px; }
          .compact-stat-grid { grid-template-columns:repeat(4,1fr); }
          .admin-insight-grid { grid-template-columns:1.4fr .9fr; }
          .quick-actions-panel { grid-column:1/-1; }
          .quick-action-grid { grid-template-columns:repeat(4,1fr); }
        }
        @media (max-width:980px) {
          .admin-top-brand { min-width:auto; }
          .admin-top-links { gap:12px; }
          .admin-top-links a { font-size:10px; }
          .admin-sidebar { width:220px; }
          .admin-main { width:calc(100% - 220px); margin-left:220px; }
          .main-stat-grid { grid-template-columns:repeat(2,1fr); }
          .compact-stat-grid { grid-template-columns:repeat(4,1fr); }
          .selected-projects { grid-template-columns:repeat(3,1fr); }
        }
        @media (max-width:760px) {
          .admin-topbar { height:64px; }
          .admin-topbar-inner { padding:0 16px; }
          .admin-top-copy small { display:none; }
          .admin-top-links {
            position:absolute; left:12px; right:12px; top:70px; padding:12px; display:none; flex-direction:column; align-items:stretch;
            border:1px solid rgba(255,255,255,.09); border-radius:12px; background:rgba(5,8,22,.97); box-shadow:0 20px 60px rgba(0,0,0,.4);
          }
          .admin-top-links.open { display:flex; }
          .admin-top-links a { padding:10px; font-size:12px; }
          .admin-top-menu { display:grid; place-items:center; }
          .admin-dashboard-shell { padding-top:64px; }
          .admin-sidebar { display:none; }
          .admin-main { width:100%; margin-left:0; padding:28px 16px 20px; }
          .admin-header { flex-direction:column; }
          .admin-header-actions { width:100%; flex-wrap:wrap; }
          .admin-insight-grid { grid-template-columns:1fr; }
          .quick-actions-panel { grid-column:auto; }
          .quick-action-grid { grid-template-columns:repeat(2,1fr); }
          .selected-projects { grid-template-columns:1fr 1fr; }
        }
        @media (max-width:500px) {
          .main-stat-grid, .compact-stat-grid { grid-template-columns:1fr; }
          .quick-action-grid, .selected-projects { grid-template-columns:1fr; }
          .admin-footer { flex-direction:column; gap:7px; align-items:flex-start; }
          .admin-status-bar { align-items:flex-start; flex-direction:column; padding:10px 12px; }
          .admin-header h1 { font-size:26px; }
        }
      `}</style>

    </>
  );
}

function SideLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href} className={`admin-side-link ${active ? "active" : ""}`}>
      <span>{icon}</span>
      {label}
      <ArrowUpRight className="side-arrow" size={13} />
    </Link>
  );
}

function MainStat({
  label,
  value,
  description,
  Icon,
  tone,
  series = [],
}: {
  label: string;
  value: number;
  description: string;
  Icon: any;
  tone: string;
  series?: number[];
}) {
  const points = useMemo(() => {
    const source = Array.isArray(series) ? series.map(Number) : [];
    if (!source.length) return [];
    const max = Math.max(...source, 0);
    const min = Math.min(...source, 0);

    if (max === min) {
      return source.map(() => 50);
    }

    return source.map((item) => {
      const normalized = ((item - min) / (max - min)) * 72;
      return 14 + normalized;
    });
  }, [series]);

  return (
    <div className={`main-stat ${tone}`}>
      <div className="main-stat-top">
        <div className="main-stat-icon"><Icon size={24} /></div>
        <div className="admin-eyebrow">{label}</div>
      </div>
      <strong>{value.toLocaleString("en-IN")}</strong>
      <span>{description}</span>
      <Sparkline points={points.length ? points : [50, 50, 50, 50, 50, 50, 50]} />
    </div>
  );
}

function CompactStat({
  label,
  value,
  description,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  Icon: any;
  tone: string;
}) {
  return (
    <div className={`compact-stat ${tone}`}>
      <div className="compact-icon"><Icon size={19} /></div>
      <div className="compact-copy">
        <div className="compact-label">{label}</div>
        <strong>{value.toLocaleString("en-IN")}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const coords = points.map((y, i) => `${(i / (points.length - 1)) * 100},${100 - y}`).join(" ");
  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={coords} fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DashboardChart({ analytics }: { analytics: Analytics }) {
  const values = [
    analytics.totalVisitors,
    analytics.pageViews,
    analytics.projectClicks,
    analytics.resumeViews,
    analytics.githubClicks,
    analytics.contacts,
    analytics.totalEvents,
  ];
  const labels = ["Visitors", "Views", "Projects", "Resume", "GitHub", "Contacts", "Events"];
  const max = Math.max(...values, 1);

  return (
    <div className="overview-chart">
      <div className="chart-grid-lines">
        {[100, 75, 50, 25, 0].map((value) => (
          <span key={value} style={{ bottom: `${value}%` }} />
        ))}
      </div>

      <div className="overview-bars">
        {values.map((value, index) => (
          <div className="overview-bar-wrap" key={labels[index]}>
            <div
              className="overview-bar"
              style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            />
            <span>{labels[index]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="engagement-row">
      <div><span>{icon}</span>{label}</div>
      <strong>{value.toLocaleString("en-IN")}</strong>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="quick-action">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </div>
      <ArrowUpRight size={14} />
    </Link>
  );
}
