"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Eye, UploadCloud, UserRound, ImagePlus, LayoutTemplate, GraduationCap, BriefcaseBusiness, Mail, PanelBottom } from "lucide-react";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content";

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

type SiteProfile={displayName:string;headline:string;avatarFileId:string|null;aboutIntro:string;aboutSecondary:string;aboutHighlights:string[];careerGoal:string;careerSubline:string;cgpa:string;projectStat:string;analyticsStat:string;strengths:string[];values:string[];interests:string[];tools:string[];skillsGroups:any[]};
const emptyProfile:SiteProfile={displayName:"Vivek Bhatt",headline:"Data Analytics • MIS • Business Intelligence",avatarFileId:null,aboutIntro:"I am a BCA graduate and aspiring Data Analyst with a growing interest in turning raw information into clear, meaningful insights.",aboutSecondary:"I am building my practical knowledge through hands-on projects using MS Excel, SQL, Power BI and Python. My focus is on understanding data, finding patterns, creating useful dashboards and presenting information in a simple and understandable way.",aboutHighlights:["BCA graduate with a strong interest in Data Analytics","Hands-on experience through self-driven projects","Building dashboards and analytical reports","Focused on developing job-ready analytical skills"],careerGoal:"Data Analyst",careerSubline:"Business Intelligence",cgpa:"8.0",projectStat:"4+",analyticsStat:"6+",strengths:["Analytical thinking","Problem solving","Attention to detail","Data visualization"],values:["Continuous learning","Accuracy & consistency","Practical approach","Professional growth"],interests:["Data Analytics","Business Intelligence","Dashboard Design","Data Visualization"],tools:["MS Excel","SQL","Power BI","Python"],skillsGroups:[]};

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
  const [profile, setProfile] = useState<SiteProfile>(emptyProfile);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

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

      setProjects(data.projects || []); setCertificates(data.certificates || []); setResumes(data.resumes || []);
      const pr=await fetch("/api/admin/site",{cache:"no-store"}); const pd=await pr.json().catch(()=>({})); if(pr.ok&&pd.profile)setProfile({...emptyProfile,...pd.profile}); if(pr.ok&&pd.siteContent)setSiteContent(pd.siteContent);
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

  const saveProfile=async()=>{setBusy(true);setError("");setMessage("");try{const r=await fetch("/api/admin/site",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile,siteContent})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Unable to save site settings.");setProfile({...emptyProfile,...(d.profile||profile)});setSiteContent(d.siteContent||siteContent);setMessage(d.message||"Profile and site content saved successfully.");}catch(e){setError(e instanceof Error?e.message:"Unable to save site settings.");}finally{setBusy(false);}};
  const listUpdate=(key:"strengths"|"values"|"interests"|"tools",value:string)=>setProfile(p=>({...p,[key]:value.split("\n").map(v=>v.trim()).filter(Boolean)}));
  const skillsJson=(value:string)=>{try{const parsed=JSON.parse(value);if(Array.isArray(parsed))setProfile(p=>({...p,skillsGroups:parsed}));}catch{}};

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
          ["profile", "Profile & About"],
          ["site", "Site Sections"],
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

      {tab === "profile" && <section className="studio-grid profile-studio-grid"><div className="studio-form"><div className="studio-form-head"><div><span className="eyebrow">PROFILE CONTROL</span><h2>About, skills & profile</h2></div><UserRound size={18}/></div><div className="studio-fields">{input("Display name",profile.displayName,v=>setProfile(p=>({...p,displayName:v})))}{input("Headline",profile.headline,v=>setProfile(p=>({...p,headline:v})))}<label className="studio-field studio-full"><span>Profile photo / DP</span><input type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{const u=await uploadAsset(f,false);setProfile(p=>({...p,avatarFileId:String(u.id)}));setMessage("Profile photo uploaded. Save changes to publish it.");}catch(x){setError(x instanceof Error?x.message:"Upload failed.");}finally{setBusy(false);}}}/></label>{profile.avatarFileId&&<div className="profile-avatar-preview"><img src={`/api/files/${encodeURIComponent(profile.avatarFileId)}`} alt="Profile preview"/><span>Current profile photo</span><button type="button" className="profile-avatar-remove" onClick={()=>setProfile(p=>({...p,avatarFileId:null}))}>Remove DP</button></div>}<label className="studio-field studio-full"><span>About — main introduction</span><textarea value={profile.aboutIntro} onChange={e=>setProfile(p=>({...p,aboutIntro:e.target.value}))}/></label><label className="studio-field studio-full"><span>About — supporting paragraph</span><textarea value={profile.aboutSecondary} onChange={e=>setProfile(p=>({...p,aboutSecondary:e.target.value}))}/></label><label className="studio-field studio-full"><span>About highlights — one per line</span><textarea value={profile.aboutHighlights.join("\n")} onChange={e=>setProfile(p=>({...p,aboutHighlights:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)}))}/></label>{input("Career goal",profile.careerGoal,v=>setProfile(p=>({...p,careerGoal:v})))}{input("Career subline",profile.careerSubline,v=>setProfile(p=>({...p,careerSubline:v})))}{input("CGPA",profile.cgpa,v=>setProfile(p=>({...p,cgpa:v})))}{input("Projects stat",profile.projectStat,v=>setProfile(p=>({...p,projectStat:v})))}{input("Analytics areas stat",profile.analyticsStat,v=>setProfile(p=>({...p,analyticsStat:v})))}{([['strengths','Strengths (one per line)'],['values','Values (one per line)'],['interests','Interests (one per line)'],['tools','Toolkit (one per line)']] as const).map(([k,l])=><label key={k} className="studio-field studio-full"><span>{l}</span><textarea value={profile[k].join("\n")} onChange={e=>listUpdate(k,e.target.value)}/></label>)}<label className="studio-field studio-full"><span>Skills groups JSON</span><textarea className="profile-skills-json" value={JSON.stringify(profile.skillsGroups,null,2)} onChange={e=>skillsJson(e.target.value)}/></label></div><button className="studio-save" disabled={busy} onClick={saveProfile} type="button"><Save size={15}/> {busy?"Saving…":"Save profile & site"}</button></div><div className="studio-form profile-help-card"><span className="eyebrow">LIVE CONTROL</span><h2>About, skills & DP</h2><p>Save changes to PostgreSQL. Your public About and Skills sections will use the saved values without changing your existing colors or layout.</p><div className="profile-control-list"><div><ImagePlus size={16}/><span>Upload a future DP from the admin panel</span></div><div><UserRound size={16}/><span>Change display name and headline</span></div><div><Save size={16}/><span>Edit About paragraphs and lists</span></div><div><UploadCloud size={16}/><span>Edit Skills groups and items</span></div></div><Link href="/portfolio#about" className="studio-preview">Preview About section</Link></div></section>}

      {tab === "site" && <section className="studio-grid site-sections-grid">
        <div className="studio-form">
          <div className="studio-form-head"><div><span className="eyebrow">SITE SECTIONS</span><h2>Control portfolio text & sections</h2></div><LayoutTemplate size={18}/></div>
          <div className="site-editor-stack">
            <div className="site-editor-block"><div className="site-editor-title"><LayoutTemplate size={16}/><strong>Hero</strong></div>
              {input("Hero eyebrow",siteContent.hero.eyebrow,v=>setSiteContent(c=>({...c,hero:{...c.hero,eyebrow:v}})))}
              {input("Hero index",siteContent.hero.index,v=>setSiteContent(c=>({...c,hero:{...c.hero,index:v}})))}
              <label className="studio-field studio-full"><span>Typing roles — one per line</span><textarea value={siteContent.hero.roleWords.join("\n")} onChange={e=>setSiteContent(c=>({...c,hero:{...c.hero,roleWords:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)}}))}/></label>
              <label className="studio-field studio-full"><span>Hero description</span><textarea value={siteContent.hero.description} onChange={e=>setSiteContent(c=>({...c,hero:{...c.hero,description:e.target.value}}))}/></label>
              <label className="studio-field studio-full"><span>Hero secondary description</span><textarea value={siteContent.hero.secondaryDescription} onChange={e=>setSiteContent(c=>({...c,hero:{...c.hero,secondaryDescription:e.target.value}}))}/></label>
              <label className="studio-field studio-full"><span>Hero stats JSON</span><textarea value={JSON.stringify(siteContent.hero.stats,null,2)} onChange={e=>{try{const v=JSON.parse(e.target.value);if(Array.isArray(v))setSiteContent(c=>({...c,hero:{...c.hero,stats:v}}));}catch{}}}/></label>
              {input("Hero card label",siteContent.hero.cardLabel,v=>setSiteContent(c=>({...c,hero:{...c.hero,cardLabel:v}})))}
              {input("Hero card title",siteContent.hero.cardTitle,v=>setSiteContent(c=>({...c,hero:{...c.hero,cardTitle:v}})))}
              <label className="studio-field studio-full"><span>Hero card description</span><textarea value={siteContent.hero.cardDescription} onChange={e=>setSiteContent(c=>({...c,hero:{...c.hero,cardDescription:e.target.value}}))}/></label>
              {input("Project count",siteContent.hero.projectCount,v=>setSiteContent(c=>({...c,hero:{...c.hero,projectCount:v}})))}
              {input("Hero location",siteContent.hero.location,v=>setSiteContent(c=>({...c,hero:{...c.hero,location:v}})))}
              {input("Hero period",siteContent.hero.period,v=>setSiteContent(c=>({...c,hero:{...c.hero,period:v}})))}
            </div>

            <div className="site-editor-block"><div className="site-editor-title"><GraduationCap size={16}/><strong>Education</strong></div>
              {input("Education eyebrow",siteContent.education.eyebrow,v=>setSiteContent(c=>({...c,education:{...c.education,eyebrow:v}})))}
              {input("Education title",siteContent.education.title,v=>setSiteContent(c=>({...c,education:{...c.education,title:v}})))}
              {input("Education title accent",siteContent.education.titleAccent,v=>setSiteContent(c=>({...c,education:{...c.education,titleAccent:v}})))}
              <label className="studio-field studio-full"><span>Education description</span><textarea value={siteContent.education.description} onChange={e=>setSiteContent(c=>({...c,education:{...c.education,description:e.target.value}}))}/></label>
              <label className="studio-field studio-full"><span>Education items JSON</span><textarea className="profile-skills-json" value={JSON.stringify(siteContent.education.items,null,2)} onChange={e=>{try{const v=JSON.parse(e.target.value);if(Array.isArray(v))setSiteContent(c=>({...c,education:{...c.education,items:v}}));}catch{}}}/></label>
              {input("Education footer label",siteContent.education.footerLabel,v=>setSiteContent(c=>({...c,education:{...c.education,footerLabel:v}})))}
              {input("Education footer text",siteContent.education.footerText,v=>setSiteContent(c=>({...c,education:{...c.education,footerText:v}})))}
            </div>

            <div className="site-editor-block"><div className="site-editor-title"><BriefcaseBusiness size={16}/><strong>Experience</strong></div>
              {input("Experience eyebrow",siteContent.experience.eyebrow,v=>setSiteContent(c=>({...c,experience:{...c.experience,eyebrow:v}})))}
              {input("Experience title",siteContent.experience.title,v=>setSiteContent(c=>({...c,experience:{...c.experience,title:v}})))}
              <label className="studio-field studio-full"><span>Experience entries JSON</span><textarea className="profile-skills-json" value={JSON.stringify(siteContent.experience.entries,null,2)} onChange={e=>{try{const v=JSON.parse(e.target.value);if(Array.isArray(v))setSiteContent(c=>({...c,experience:{...c.experience,entries:v}}));}catch{}}}/></label>
            </div>

            <div className="site-editor-block"><div className="site-editor-title"><Mail size={16}/><strong>Contact</strong></div>
              {input("Contact eyebrow",siteContent.contact.eyebrow,v=>setSiteContent(c=>({...c,contact:{...c.contact,eyebrow:v}})))}
              {input("Contact title",siteContent.contact.title,v=>setSiteContent(c=>({...c,contact:{...c.contact,title:v}})))}
              <label className="studio-field studio-full"><span>Contact description</span><textarea value={siteContent.contact.text} onChange={e=>setSiteContent(c=>({...c,contact:{...c.contact,text:e.target.value}}))}/></label>
              {input("Public email",siteContent.contact.email,v=>setSiteContent(c=>({...c,contact:{...c.contact,email:v}})),{type:"email"})}
              {input("LinkedIn URL",siteContent.contact.linkedin,v=>setSiteContent(c=>({...c,contact:{...c.contact,linkedin:v}})),{type:"url"})}
              {input("GitHub URL",siteContent.contact.github,v=>setSiteContent(c=>({...c,contact:{...c.contact,github:v}})),{type:"url"})}
              {input("Location",siteContent.contact.location,v=>setSiteContent(c=>({...c,contact:{...c.contact,location:v}})))}
            </div>

            <div className="site-editor-block"><div className="site-editor-title"><PanelBottom size={16}/><strong>Footer</strong></div>
              <label className="studio-field studio-full"><span>Footer description</span><textarea value={siteContent.footer.description} onChange={e=>setSiteContent(c=>({...c,footer:{...c.footer,description:e.target.value}}))}/></label>
              {input("Footer LinkedIn",siteContent.footer.linkedin,v=>setSiteContent(c=>({...c,footer:{...c.footer,linkedin:v}})))}
              {input("Footer GitHub",siteContent.footer.github,v=>setSiteContent(c=>({...c,footer:{...c.footer,github:v}})))}
              {input("Footer CTA label",siteContent.footer.ctaLabel,v=>setSiteContent(c=>({...c,footer:{...c.footer,ctaLabel:v}})))}
              {input("Footer CTA title",siteContent.footer.ctaTitle,v=>setSiteContent(c=>({...c,footer:{...c.footer,ctaTitle:v}})))}
            </div>
          </div>
          <button className="studio-save" disabled={busy} onClick={saveProfile} type="button"><Save size={15}/> {busy?"Saving…":"Save all site sections"}</button>
        </div>
        <div className="studio-form profile-help-card"><span className="eyebrow">LIVE CONTROL</span><h2>Everything in one place</h2><p>Edit the portfolio sections here without touching source code. Projects, certificates and CV still have their dedicated editors.</p><div className="profile-control-list"><div><LayoutTemplate size={16}/><span>Hero text, roles and stats</span></div><div><GraduationCap size={16}/><span>Education content and timeline</span></div><div><BriefcaseBusiness size={16}/><span>Experience entries</span></div><div><Mail size={16}/><span>Contact email, links and location</span></div><div><PanelBottom size={16}/><span>Footer text and social links</span></div></div><Link href="/portfolio" className="studio-preview">Preview live portfolio</Link></div>
      </section>}

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