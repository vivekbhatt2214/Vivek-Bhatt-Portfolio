"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Phone,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import CustomCursor from "@/components/extras/CustomCursor";

type ActivityView = "all" | "downloads" | "calls";

type DownloadRecord = {
  id: number | string;
  project_title: string;
  email: string;
  verified_at?: string | null;
  downloaded_at?: string | null;
  created_at: string;
};

type CallRecord = {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  preferred_time?: string | null;
  reason?: string | null;
  status?: string | null;
  created_at: string;
};

export default function Activity() {
  const [view, setView] = useState<ActivityView>("all");

  const [data, setData] = useState<{
    downloads: DownloadRecord[];
    calls: CallRecord[];
  }>({
    downloads: [],
    calls: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("view");

    if (value === "downloads" || value === "calls") {
      setView(value);
    } else {
      setView("all");
    }
  }, []);

  const load = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/activity", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load activity.");
      }

      setData({
        downloads: Array.isArray(payload?.downloads)
          ? payload.downloads
          : [],
        calls: Array.isArray(payload?.calls) ? payload.calls : [],
      });
    } catch (error) {
      console.error("Activity load error:", error);

      setData({
        downloads: [],
        calls: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openView = (nextView: ActivityView) => {
    setView(nextView);

    const url = new URL(window.location.href);

    if (nextView === "all") {
      url.searchParams.delete("view");
    } else {
      url.searchParams.set("view", nextView);
    }

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}`
    );
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-IN");
  };

  return (
    <>
      <CustomCursor />

      <main className="studio-page">
        <div className="studio-header">
          <div>
            <Link href="/admin" className="studio-back">
              <ArrowLeft size={15} /> Back to Command Center
            </Link>

            <span className="eyebrow">ENGAGEMENT RECORDS</span>

            <h1>Downloads &amp; Call Requests</h1>

            <p>
              Verified project-file downloads and visitor call requests are
              stored in PostgreSQL so you can see who requested access and
              when.
            </p>
          </div>

          <button
            className="studio-preview"
            onClick={load}
            disabled={loading}
            type="button"
          >
            <RefreshCw
              size={15}
              className={loading ? "activity-spin" : ""}
            />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="activity-view-switch">
          <button
            type="button"
            className={view === "all" ? "active" : ""}
            onClick={() => openView("all")}
          >
            All records
          </button>

          <button
            type="button"
            className={view === "downloads" ? "active" : ""}
            onClick={() => openView("downloads")}
          >
            <Download size={14} />
            Verified downloads
          </button>

          <button
            type="button"
            className={view === "calls" ? "active" : ""}
            onClick={() => openView("calls")}
          >
            <Phone size={14} />
            Call requests
          </button>
        </div>

        {view === "all" ? (
          <div className="activity-two-col">
            <ActivityCard
              title="Verified downloads"
              eyebrow="PROJECT FILE ACCESS"
              icon={<Download size={19} />}
              count={data.downloads.length}
              onClick={() => openView("downloads")}
            >
              {data.downloads.map((item) => (
                <DownloadRecordRow
                  key={String(item.id)}
                  item={item}
                  formatDate={formatDate}
                />
              ))}

              {!data.downloads.length && (
                <p className="empty-record">
                  No download requests yet.
                </p>
              )}
            </ActivityCard>

            <ActivityCard
              title="Call requests"
              eyebrow="CONTACT INTENT"
              icon={<Phone size={19} />}
              count={data.calls.length}
              onClick={() => openView("calls")}
            >
              {data.calls.map((item) => (
                <CallRecordRow
                  key={String(item.id)}
                  item={item}
                  formatDate={formatDate}
                />
              ))}

              {!data.calls.length && (
                <p className="empty-record">
                  No call requests yet.
                </p>
              )}
            </ActivityCard>
          </div>
        ) : (
          <section className="activity-card activity-card-expanded">
            <div className="activity-card-head">
              <div>
                <span className="eyebrow">
                  {view === "downloads"
                    ? "PROJECT FILE ACCESS"
                    : "CONTACT INTENT"}
                </span>

                <h2>
                  {view === "downloads"
                    ? "Verified downloads"
                    : "Call requests"}
                </h2>

                <p className="activity-count">
                  {view === "downloads"
                    ? `${data.downloads.length} record${
                        data.downloads.length === 1 ? "" : "s"
                      }`
                    : `${data.calls.length} record${
                        data.calls.length === 1 ? "" : "s"
                      }`}
                </p>
              </div>

              {view === "downloads" ? (
                <Download size={19} />
              ) : (
                <Phone size={19} />
              )}
            </div>

            <div className="activity-full-list">
              {view === "downloads" &&
                data.downloads.map((item) => (
                  <DownloadRecordRow
                    key={String(item.id)}
                    item={item}
                    formatDate={formatDate}
                    expanded
                  />
                ))}

              {view === "calls" &&
                data.calls.map((item) => (
                  <CallRecordRow
                    key={String(item.id)}
                    item={item}
                    formatDate={formatDate}
                    expanded
                  />
                ))}

              {view === "downloads" && !data.downloads.length && (
                <p className="empty-record">
                  No download requests yet.
                </p>
              )}

              {view === "calls" && !data.calls.length && (
                <p className="empty-record">
                  No call requests yet.
                </p>
              )}
            </div>

            <button
              type="button"
              className="activity-back-button"
              onClick={() => openView("all")}
            >
              <ArrowLeft size={14} />
              Show both sections
            </button>
          </section>
        )}
      </main>

      <style jsx>{`
        .activity-view-switch {
          max-width: 1250px;
          margin: 20px auto 14px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .activity-view-switch button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          padding: 9px 12px;
          background: rgba(255, 255, 255, 0.025);
          color: #7f8da1;
          font-size: 9px;
          cursor: pointer;
          transition: 0.2s;
        }

        .activity-view-switch button:hover,
        .activity-view-switch button.active {
          color: #fff;
          border-color: rgba(240, 166, 60, 0.35);
          background: rgba(240, 166, 60, 0.08);
        }

        .activity-card {
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .activity-card:hover {
          transform: translateY(-2px);
          border-color: rgba(240, 166, 60, 0.28);
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
        }

        .activity-card-count {
          display: block;
          margin-top: 6px;
          color: #65758a;
          font-size: 8px;
          font-weight: 500;
        }

        .activity-card-icon {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #f0a63c;
        }

        .record-row-expanded {
          padding-top: 17px;
          padding-bottom: 17px;
        }

        .record-row-expanded small {
          line-height: 1.4;
        }

        .activity-card-expanded {
          max-width: 1250px;
          margin: 18px auto;
          cursor: default;
        }

        .activity-card-expanded:hover {
          transform: none;
        }

        .activity-count {
          margin: 5px 0 0;
          color: #65758a;
          font-size: 8px;
        }

        .activity-full-list {
          display: grid;
          gap: 0;
        }

        .activity-full-list .record-row {
          min-height: 62px;
        }

        .activity-back-button {
          margin-top: 16px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.025);
          color: #9aa7ba;
          cursor: pointer;
          font-size: 9px;
        }

        .activity-back-button:hover {
          color: #fff;
          border-color: rgba(240, 166, 60, 0.3);
        }

        .activity-spin {
          animation: activity-spin 0.8s linear infinite;
        }

        @keyframes activity-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

function ActivityCard({
  title,
  eyebrow,
  icon,
  count,
  onClick,
  children,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className="activity-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${title}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="activity-card-head">
        <div>
          <span className="eyebrow">{eyebrow}</span>

          <h2>{title}</h2>

          <small className="activity-card-count">
            {count} {count === 1 ? "record" : "records"} · Click to open full
            list
          </small>
        </div>

        <div className="activity-card-icon">
          {icon}
          <ArrowUpRight size={13} />
        </div>
      </div>

      {children}
    </section>
  );
}

function DownloadRecordRow({
  item,
  formatDate,
  expanded = false,
}: {
  item: DownloadRecord;
  formatDate: (value?: string | null) => string;
  expanded?: boolean;
}) {
  return (
    <div
      className={`record-row ${
        expanded ? "record-row-expanded" : ""
      }`}
    >
      <div>
        <strong>{item.project_title || "Project file"}</strong>

        <span>{item.email}</span>

        {expanded && item.downloaded_at && (
          <small>
            Downloaded: {formatDate(item.downloaded_at)}
          </small>
        )}
      </div>

      <div>
        <small>
          {item.verified_at ? "Verified" : "Pending"}
        </small>

        <time>{formatDate(item.created_at)}</time>
      </div>
    </div>
  );
}

function CallRecordRow({
  item,
  formatDate,
  expanded = false,
}: {
  item: CallRecord;
  formatDate: (value?: string | null) => string;
  expanded?: boolean;
}) {
  return (
    <div
      className={`record-row ${
        expanded ? "record-row-expanded" : ""
      }`}
    >
      <div>
        <strong>{item.name || "Visitor"}</strong>

        <span>
          {item.email}
          {item.phone ? ` • ${item.phone}` : ""}
        </span>

        {expanded && (
          <>
            <small>
              Reason: {item.reason || "General call"}
            </small>

            <small>
              Preferred time:{" "}
              {item.preferred_time || "Not provided"}
            </small>
          </>
        )}
      </div>

      <div>
        <small>{item.status || "PENDING"}</small>

        <time>{formatDate(item.created_at)}</time>
      </div>
    </div>
  );
}