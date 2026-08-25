"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import CustomCursor from "@/components/extras/CustomCursor";

type View = "all" | "messages" | "interviews" | "downloads" | "calls";
type RecordData = {
  downloads: any[];
  calls: any[];
  messages: any[];
  interviews: any[];
};

type ModalRecord = { type: string; record: any };
const empty: RecordData = { downloads: [], calls: [], messages: [], interviews: [] };

export default function Activity() {
  const [view, setView] = useState<View>("all");
  const [data, setData] = useState<RecordData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ModalRecord | null>(null);
  const [viewing, setViewing] = useState<ModalRecord | null>(null);
  const [replying, setReplying] = useState<ModalRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyNotice, setReplyNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ModalRecord | null>(null);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("view");
    if (["messages", "interviews", "downloads", "calls"].includes(value || "")) {
      setView(value as View);
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/activity", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Unable to load records.");
      setData({
        downloads: Array.isArray(payload.downloads) ? payload.downloads : [],
        calls: Array.isArray(payload.calls) ? payload.calls : [],
        messages: Array.isArray(payload.messages) ? payload.messages : [],
        interviews: Array.isArray(payload.interviews) ? payload.interviews : [],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openView = (next: View) => {
    setView(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("view");
    else url.searchParams.set("view", next);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const formatDate = (value: any) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-IN");
  };

  const formatInterviewDate = (value: any) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  async function remove(type: string, id: string | number, record?: any) { setDeleteTarget({ type, record: record || { id } }); }

  async function confirmDelete() {
    if (!deleteTarget) return; const {type,record}=deleteTarget; setDeleteTarget(null); setError("");
    try { const response=await fetch("/api/admin/activity",{method:"DELETE",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({type,id:String(record.id)})}); const payload=await response.json().catch(()=>({})); if(!response.ok)throw new Error(payload?.error||"Delete failed."); setToast({message:payload?.message||"Record deleted successfully."}); await load(); window.setTimeout(()=>setToast(null),3200); }
    catch(e){const message=e instanceof Error?e.message:"Delete failed.";setError(message);setToast({message,error:true});window.setTimeout(()=>setToast(null),4200);}
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          type: editing.type,
          id: String(editing.record.id),
          data: editing.record,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Update failed.");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReply() {
    if (!replying || !replyText.trim()) return;
    setReplySending(true);
    setReplyNotice("");
    setError("");
    try {
      const response = await fetch("/api/admin/activity/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          type: replying.type,
          id: String(replying.record.id),
          message: replyText.trim(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Unable to send reply.");
      setReplyNotice(payload?.message || "Reply sent successfully."); setToast({message:payload?.message||"Reply sent successfully."}); setReplyText(""); await load(); window.setTimeout(()=>setToast(null),4200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to send reply.");
    } finally {
      setReplySending(false);
    }
  }

  const totals = useMemo(
    () => [
      ["messages", "Contact Messages", Mail, data.messages.length],
      ["interviews", "Interview Requests", CalendarClock, data.interviews.length],
      ["downloads", "Verified Downloads", Download, data.downloads.length],
      ["calls", "Call Requests", Phone, data.calls.length],
    ] as const,
    [data]
  );

  const sections = view === "all" ? totals : totals.filter(([key]) => key === view);

  return (
    <>
      <CustomCursor />
      <main className="studio-page admin-records-page">
        <div className="activity-shell">
          <header className="studio-header activity-header">
            <div className="activity-header-copy">
              <Link href="/admin" className="studio-back">
                <ArrowLeft size={15} /> Back to Command Center
              </Link>
              <span className="eyebrow">ENGAGEMENT RECORDS</span>
              <h1>Contact, Interview &amp; Activity</h1>
              <p>
                Manage visitor messages, interview bookings, verified downloads and call requests.
                Open, edit, reply to or permanently delete records from this private admin workspace.
              </p>
            </div>
            <button className="studio-preview activity-refresh" onClick={load} disabled={loading} type="button">
              <RefreshCw size={15} className={loading ? "activity-spin" : ""} />
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </header>

          <nav className="activity-view-switch" aria-label="Activity filters">
            <button className={view === "all" ? "active" : ""} onClick={() => openView("all")} type="button">
              All records
            </button>
            {totals.map(([key, label, Icon, count]) => (
              <button key={key} className={view === key ? "active" : ""} onClick={() => openView(key)} type="button">
                <Icon size={14} />
                <span>{label}</span>
                <b>{count}</b>
              </button>
            ))}
          </nav>

          {error && <div className="admin-record-error">{error}</div>}

          <div className="admin-record-grid">
            {sections.map(([key, title, Icon, count]) => (
              <section className="activity-card admin-record-card" key={key}>
                <div className="activity-card-head">
                  <div>
                    <span className="eyebrow">{title.toUpperCase()}</span>
                    <h2>{title}</h2>
                    <small className="activity-card-count">
                      {count} {count === 1 ? "record" : "records"}
                    </small>
                  </div>
                  <Icon size={20} />
                </div>

                <div className="admin-record-list">
                  {key === "messages" && data.messages.map((item) => (
                    <MessageRow
                      key={String(item.id)}
                      item={item}
                      formatDate={formatDate}
                      onView={() => setViewing({ type: "message", record: item })}
                      onReply={() => { setReplyNotice(""); setReplyText(""); setReplying({ type: "message", record: item }); }}
                      onEdit={() => setEditing({ type: "message", record: { ...item } })}
                      onDelete={() => remove("message", item.id, item)}
                    />
                  ))}

                  {key === "interviews" && data.interviews.map((item) => (
                    <InterviewRow
                      key={String(item.id)}
                      item={item}
                      formatInterviewDate={formatInterviewDate}
                      formatDate={formatDate}
                      onView={() => setViewing({ type: "interview", record: item })}
                      onReply={() => { setReplyNotice(""); setReplyText(""); setReplying({ type: "interview", record: item }); }}
                      onEdit={() => setEditing({
                        type: "interview",
                        record: {
                          ...item,
                          date: item.date ? new Date(item.date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "",
                        },
                      })}
                      onDelete={() => remove("interview", item.id, item)}
                    />
                  ))}

                  {key === "downloads" && data.downloads.map((item) => (
                    <DownloadRow
                      key={String(item.id)}
                      item={item}
                      formatDate={formatDate}
                      onView={() => setViewing({ type: "download", record: item })}
                      onEdit={() => setEditing({ type: "download", record: {
                        id: item.id,
                        projectTitle: item.project_title || "",
                        email: item.email || "",
                        verifiedAt: item.verified_at || "",
                        downloadedAt: item.downloaded_at || "",
                      }})}
                      onDelete={() => remove("download", item.id, item)}
                    />
                  ))}

                  {key === "calls" && data.calls.map((item) => (
                    <CallRow
                      key={String(item.id)}
                      item={item}
                      formatDate={formatDate}
                      onView={() => setViewing({ type: "call", record: item })}
                      onEdit={() => setEditing({ type: "call", record: {
                        id: item.id,
                        name: item.name || "",
                        email: item.email || "",
                        phone: item.phone || "",
                        preferredTime: item.preferred_time || "",
                        reason: item.reason || "",
                        message: item.message || "",
                        status: item.status || "PENDING",
                      }})}
                      onDelete={() => remove("call", item.id, item)}
                    />
                  ))}

                  {!count && <p className="empty-record">No records yet.</p>}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {toast && <div className="activity-toast-stack"><div className={`activity-toast ${toast.error ? "error" : ""}`}>{toast.message}</div></div>}
      {deleteTarget && <DeleteConfirmModal record={deleteTarget.record} type={deleteTarget.type} onCancel={()=>setDeleteTarget(null)} onConfirm={confirmDelete}/>}
      {viewing && <ViewModal type={viewing.type} record={viewing.record} onClose={() => setViewing(null)} />}
      {editing && <EditModal type={editing.type} record={editing.record} setRecord={(record) => setEditing({ ...editing, record })} onClose={() => setEditing(null)} onSave={saveEdit} saving={saving} />}
      {replying && <ReplyModal type={replying.type} record={replying.record} message={replyText} setMessage={setReplyText} notice={replyNotice} sending={replySending} onClose={() => setReplying(null)} onSend={sendReply} />}
    </>
  );
}

function MessageRow({ item, formatDate, onView, onReply, onEdit, onDelete }: any) {
  return (
    <RecordRow
      item={item}
      title={item.name || "Visitor message"}
      subtitle={`${item.email} • ${item.reason || "General enquiry"}`}
      body={item.message}
      meta={`${item.verified ? "Verified email" : "Email pending"} • ${formatDate(item.createdAt)}`}
      status={item.verified ? "VERIFIED" : "PENDING"}
      reply
      onView={onView}
      onReply={onReply}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function InterviewRow({ item, formatInterviewDate, formatDate, onView, onReply, onEdit, onDelete }: any) {
  return (
    <RecordRow
      item={item}
      title={item.name || "Interview request"}
      subtitle={`${item.email}${item.company ? ` • ${item.company}` : ""}`}
      body={`${item.interviewType || "Job Interview"} • ${formatInterviewDate(item.date)} • ${item.startTime || ""} – ${item.endTime || ""}${item.message ? `\n${item.message}` : ""}`}
      meta={`${item.status || "PENDING"} • Created ${formatDate(item.createdAt)}`}
      status={item.status || "PENDING"}
      reply
      onView={onView}
      onReply={onReply}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function DownloadRow({ item, formatDate, onView, onEdit, onDelete }: any) {
  return (
    <RecordRow
      item={item}
      title={item.project_title || "Project file"}
      subtitle={item.email}
      meta={`${item.verified_at ? "Verified" : "Pending"} • ${item.downloaded_at ? `Downloaded ${formatDate(item.downloaded_at)}` : "Not downloaded"}`}
      status={item.verified_at ? "VERIFIED" : "PENDING"}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function CallRow({ item, formatDate, onView, onEdit, onDelete }: any) {
  return (
    <RecordRow
      item={item}
      title={item.name || "Call request"}
      subtitle={`${item.email}${item.phone ? ` • ${item.phone}` : ""}`}
      body={`${item.reason || "General call"}${item.preferred_time ? ` • Preferred ${item.preferred_time}` : ""}${item.message ? `\n${item.message}` : ""}`}
      meta={`${item.status || "PENDING"} • ${formatDate(item.created_at)}`}
      status={item.status || "PENDING"}
      phone={item.phone}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function RecordRow({ item, title, subtitle, body, meta, status, reply, phone, onView, onReply, onEdit, onDelete }: any) {
  const [copied, setCopied] = useState(false);
  return (
    <article className="admin-record-row">
      <div className="admin-record-main">
        <div className="record-person">
          <Avatar email={item.email} name={title} src={item.avatar_url} fallbackSrc={item.avatar_fallback_url} alternateSrc={item.avatar_urls?.[1]} />
          <div className="record-person-copy">
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </div>
        </div>
        {body && <p>{body}</p>}
        {phone && <button className="phone-copy-button" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(String(phone));setCopied(true);window.setTimeout(()=>setCopied(false),1800);}catch{setCopied(false);}}}><Phone size={11}/>{copied?"Copied":`Copy ${phone}`}</button>}
        <small className="admin-record-meta">{meta}</small>
        {Array.isArray(item.replyHistory)&&item.replyHistory.length>0&&<div className="record-reply-history"><small>REPLY HISTORY · {item.replyHistory.length}</small>{item.replyHistory.slice(0,3).map((r:any)=><article key={r.id}><small>{new Date(r.sent_at).toLocaleString("en-IN")} · {r.recipient_email}</small><p>{r.message}</p></article>)}</div>}
      </div>
      <div className="admin-record-side">
        <span className="admin-record-status"><CheckCircle2 size={10} />{status}</span>
        <div className="admin-record-actions">
          <button title="View" aria-label="View record" onClick={onView} type="button"><Eye size={14} /></button>
          {reply && <button title="Reply by email" aria-label="Reply by email" className="reply-button" onClick={onReply} type="button"><Reply size={14} /></button>}
          <button title="Edit" aria-label="Edit record" onClick={onEdit} type="button"><Edit3 size={14} /></button>
          <button title="Delete" aria-label="Delete record" className="danger" onClick={onDelete} type="button"><Trash2 size={14} /></button>
        </div>
      </div>
    </article>
  );
}

function Avatar({ email, name, src, fallbackSrc, alternateSrc }: { email?: string; name?: string; src?: string | null; fallbackSrc?: string | null; alternateSrc?: string | null }) {
  const [stage, setStage] = useState(0);
  const initials = (name || email || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
  const source = stage === 0 ? src : stage === 1 ? alternateSrc : stage === 2 ? fallbackSrc : null;

  return (
    <div className="record-avatar" title={email || "Email sender"}>
      {source ? <img src={source} alt="" referrerPolicy="no-referrer" onError={() => setStage((value) => value + 1)} /> : <span>{initials}</span>}
    </div>
  );
}

function DeleteConfirmModal({ record, type, onCancel, onConfirm }: { record:any; type:string; onCancel:()=>void; onConfirm:()=>void }) { const label=type==="message"?"contact message":type==="interview"?"interview request":type==="call"?"call request":"download record"; return <div className="activity-delete-backdrop" role="dialog" aria-modal="true" onMouseDown={e=>{if(e.target===e.currentTarget)onCancel();}}><div className="activity-delete-modal"><div className="activity-delete-icon"><Trash2 size={20}/></div><span className="eyebrow">PERMANENT ACTION</span><h3>Delete this {label}?</h3><p>This record will be removed from PostgreSQL and from the admin activity list. This action cannot be undone.</p><div className="activity-delete-actions"><button type="button" onClick={onCancel}>Keep record</button><button type="button" className="delete-confirm" onClick={onConfirm}>Delete permanently</button></div></div></div>; }

function ViewModal({ type, record, onClose }: { type: string; record: any; onClose: () => void }) {
  const title = type === "message" ? "Contact Message" : type === "interview" ? "Interview Request" : type === "download" ? "Verified Download" : "Call Request";
  const fields = type === "message"
    ? [["Name", record.name], ["Email", record.email], ["Reason", record.reason], ["Verification", record.verified ? "Verified" : "Pending"], ["Received", record.createdAt ? new Date(record.createdAt).toLocaleString("en-IN") : "—"], ["Message", record.message]]
    : type === "interview"
      ? [["Name", record.name], ["Email", record.email], ["Company", record.company || "—"], ["Interview Type", record.interviewType || "Job Interview"], ["Date", record.date ? new Date(record.date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }) : "—"], ["Time", `${record.startTime || ""} – ${record.endTime || ""}`], ["Status", record.status || "PENDING"], ["Meeting Link", record.meetingLink || "—"], ["Message", record.message || "—"]]
      : type === "download"
        ? [["Project", record.project_title], ["Email", record.email], ["Verified", record.verified_at ? new Date(record.verified_at).toLocaleString("en-IN") : "Pending"], ["Downloaded", record.downloaded_at ? new Date(record.downloaded_at).toLocaleString("en-IN") : "Not downloaded"]]
        : [["Name", record.name], ["Email", record.email], ["Phone", record.phone || "—"], ["Reason", record.reason || "—"], ["Preferred Time", record.preferred_time || "—"], ["Status", record.status || "PENDING"], ["Message", record.message || "—"]];

  return <ModalShell eyebrow="RECORD DETAILS" title={title} onClose={onClose}>
    <div className="detail-profile">
      <Avatar email={record.email} name={record.name || record.email} src={record.avatar_url} fallbackSrc={record.avatar_fallback_url} alternateSrc={record.avatar_urls?.[1]} />
      <div><strong>{record.name || "Record"}</strong><span>{record.email || "No email address"}</span></div>
    </div>
    <div className="detail-grid">
      {fields.map(([label, value]) => <div key={label} className={label === "Message" ? "detail-field full" : "detail-field"}><small>{label}</small><div>{String(value ?? "—")}</div></div>)}
    </div>
    {Array.isArray(record.replyHistory)&&record.replyHistory.length>0&&<div className="record-reply-history"><small>REPLY HISTORY</small>{record.replyHistory.map((r:any)=><article key={r.id}><small>{new Date(r.sent_at).toLocaleString("en-IN")} · {r.recipient_email}</small><p>{r.message}</p></article>)}</div>}
  </ModalShell>;
}

function ReplyModal({ type, record, message, setMessage, notice, sending, onClose, onSend }: any) {
  const subject = type === "message" ? `Re: ${record.reason || "Your portfolio message"} — Vivek Bhatt` : "Re: Interview booking — Vivek Bhatt";
  return <ModalShell eyebrow="EMAIL REPLY" title={`Reply to ${record.name || record.email}`} onClose={onClose}>
    <div className="reply-recipient">
      <Avatar email={record.email} name={record.name || record.email} src={record.avatar_url} fallbackSrc={record.avatar_fallback_url} alternateSrc={record.avatar_urls?.[1]} />
      <div><strong>{record.name || "Recipient"}</strong><span>{record.email}</span></div>
    </div>
    <div className="reply-subject"><small>SUBJECT</small><strong>{subject}</strong></div>
    <div className="reply-original"><small>ORIGINAL MESSAGE — INCLUDED IN YOUR REPLY</small><p>{type === "message" ? (record.message || "No original message.") : `Interview request for ${record.startTime || ""}–${record.endTime || ""}${record.message ? `\n\nApplicant message: ${record.message}` : ""}`}</p></div>
    <div className="reply-thread-note">The outgoing email includes the original request as a quoted reference, so the recipient can immediately see what you replied to.</div>
    {notice && <div className="reply-success"><CheckCircle2 size={15} />{notice}</div>}
    <label className="reply-label" htmlFor="admin-reply-message">YOUR REPLY</label>
    <textarea id="admin-reply-message" className="reply-textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your reply here…" autoFocus />
    <div className="reply-actions"><button type="button" onClick={onClose}>Close</button><button type="button" className="primary" disabled={sending || !message.trim()} onClick={onSend}>{sending ? <><span className="reply-spinner" /> Sending…</> : <><Send size={14} /> Send reply</>}</button></div>
  </ModalShell>;
}

function ModalShell({ eyebrow, title, children, onClose }: { eyebrow: string; title: string; children: ReactNode; onClose: () => void }) {
  return <div className="edit-backdrop" role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="edit-modal"><div className="edit-head"><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div><button className="edit-close" onClick={onClose} type="button" aria-label="Close"><X size={17} /></button></div>{children}</div></div>;
}

function EditModal({ type, record, setRecord, onClose, onSave, saving }: { type: string; record: any; setRecord: (r: any) => void; onClose: () => void; onSave: () => void; saving: boolean }) {
  const set = (key: string, value: any) => setRecord({ ...record, [key]: value });
  const field = (key: string, label: string, full = false) => <div className={`edit-field ${full ? "full" : ""}`}><label>{label}</label><input value={record[key] ?? ""} onChange={(e) => set(key, e.target.value)} /></div>;

  return <ModalShell eyebrow="EDIT RECORD" title={type === "message" ? "Contact Message" : type === "interview" ? "Interview Request" : type === "download" ? "Verified Download" : "Call Request"} onClose={onClose}>
    <div className="edit-grid">
      {type === "message" && <>{field("name", "Name")}{field("email", "Email")}{field("reason", "Reason")}{field("message", "Message", true)}<div className="edit-field"><label>Verification</label><select value={record.verified ? "true" : "false"} onChange={(e) => set("verified", e.target.value === "true")}><option value="true">Verified</option><option value="false">Pending</option></select></div></>}
      {type === "call" && <>{field("name", "Name")}{field("email", "Email")}{field("phone", "Phone")}{field("preferredTime", "Preferred Time")}{field("reason", "Reason")}{field("status", "Status")}{field("message", "Message", true)}</>}
      {type === "download" && <>{field("projectTitle", "Project Title")}{field("email", "Email")}{field("verifiedAt", "Verified At")}{field("downloadedAt", "Downloaded At")}</>}
      {type === "interview" && <>{field("name", "Name")}{field("email", "Email")}{field("company", "Company")}{field("interviewType", "Interview Type")}{field("date", "Date")}{field("startTime", "Start Time")}{field("endTime", "End Time")}{field("status", "Status")}{field("meetingLink", "Meeting Link", true)}{field("message", "Message", true)}</>}
    </div>
    <div className="edit-actions"><button onClick={onClose} type="button">Cancel</button><button className="primary" disabled={saving} onClick={onSave} type="button">{saving ? "Saving…" : "Save changes"}</button></div>
  </ModalShell>;
}
