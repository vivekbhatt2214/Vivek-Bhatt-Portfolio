import {
  CheckCircle2,
  Code2,
  Database,
  TrendingUp,
} from "@/components/Icons";
import SectionTitle from "@/components/SectionTitle";

const strengths = [
  "Analytical thinking",
  "Problem solving",
  "Attention to detail",
  "Data visualization",
];

const values = [
  "Continuous learning",
  "Accuracy & consistency",
  "Practical approach",
  "Professional growth",
];

const interests = [
  "Data Analytics",
  "Business Intelligence",
  "Dashboard Design",
  "Data Visualization",
];

const tools = [
  "MS Excel",
  "SQL",
  "Power BI",
  "Python",
];

export default function About() {
  return (
    <section id="about" className="section-pad about-section">

      {/* ================= SECTION INTRO ================= */}

      <SectionTitle
        eyebrow="About Me"
        title="A data-focused BCA graduate with practical capability in analysis, reporting and business intelligence."
        text="This portfolio is designed to show how I approach data work: understand the question, prepare the information, analyse the right metrics, communicate the insight and turn learning into practical output."
      />

      {/* ================= MAIN ABOUT ================= */}

      <div className="about-intro-grid">

        {/* LEFT — PERSONAL INTRODUCTION */}

        <div className="about-main-card reveal">

          <div className="about-card-label">
            <span className="about-status-dot" />
            WHO I AM
          </div>

          <h3>
            Hi, I&apos;m{" "}
            <span>Vivek Bhatt.</span>
          </h3>

          <p className="about-main-text">
            I am a BCA graduate and aspiring Data Analyst with a growing
            interest in turning raw information into clear, meaningful
            insights.
          </p>

          <p className="about-secondary-text">
            I am building my practical knowledge through hands-on projects
            using MS Excel, SQL, Power BI and Python. My focus is on
            understanding data, finding patterns, creating useful dashboards
            and presenting information in a simple and understandable way.
          </p>

          <p className="about-secondary-text">
            As a fresher, I am looking forward to starting my career in
            Data Analytics or Business Intelligence, where I can apply my
            technical knowledge, solve real-world problems and continue
            learning from practical experiences.
          </p>

          <div className="about-check-list">

            {[
              "BCA graduate with a strong interest in Data Analytics",
              "Hands-on experience through self-driven projects",
              "Building dashboards and analytical reports",
              "Focused on developing job-ready analytical skills",
            ].map((item) => (
              <div key={item} className="about-check-item">
                <CheckCircle2 size={17} />
                <span>{item}</span>
              </div>
            ))}

          </div>

        </div>


        {/* RIGHT — QUICK PROFILE */}

        <div className="about-profile-card reveal delay-1">

          <div className="profile-card-top">

            <div className="profile-avatar">
              VB
            </div>

            <div>
              <strong>Vivek Bhatt</strong>
              <span>Data Analytics • MIS • Business Intelligence</span>
            </div>

          </div>

          <div className="profile-divider" />

          <div className="profile-stats">

            <div>
              <strong>8.0</strong>
              <span>CGPA</span>
            </div>

            <div>
              <strong>4+</strong>
              <span>Projects</span>
            </div>

            <div>
              <strong>6+</strong>
              <span>Analytics Areas</span>
            </div>

          </div>

          <div className="profile-focus">

            <span>CAREER FOCUS</span>

            <strong>
              Data Analytics
            </strong>

            <p>
              Analyse • Report • Communicate
            </p>

          </div>

        </div>

      </div>


      {/* ================= FOUR PILLARS ================= */}

      <div className="about-pillars">

        {/* MY STRENGTHS */}

        <div className="about-feature-card strengths-card reveal">

          <div className="feature-icon">
            <TrendingUp size={21} />
          </div>

          <div className="feature-heading">
            <span>ANALYTICAL</span>
            <h4>My Strengths</h4>
          </div>

          <p>
            Skills I am continuously developing through academics
            and practical projects.
          </p>

          <div className="feature-tags">

            {strengths.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}

          </div>

        </div>


        {/* MY VALUES */}

        <div className="about-feature-card reveal delay-1">

          <div className="feature-icon">
            <CheckCircle2 size={21} />
          </div>

          <div className="feature-heading">
            <span>WORK ETHIC</span>
            <h4>My Values</h4>
          </div>

          <p>
            Principles that guide how I learn, work and approach
            new challenges.
          </p>

          <div className="feature-tags">

            {values.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}

          </div>

        </div>


        {/* CAREER GOAL */}

        <div className="about-feature-card career-card reveal delay-2">

          <div className="feature-icon">
            <Database size={21} />
          </div>

          <div className="feature-heading">
            <span>CAREER</span>
            <h4>Career Goal</h4>
          </div>

          <p>
            My goal is to start my professional journey in a
            data-focused role.
          </p>

          <div className="career-goal">

            <strong>
              Data Analyst
            </strong>

            <small>
              Business Intelligence
            </small>

          </div>

        </div>


        {/* RELEVANT INTERESTS */}

        <div className="about-feature-card reveal delay-3">

          <div className="feature-icon">
            <Code2 size={21} />
          </div>

          <div className="feature-heading">
            <span>INTERESTS</span>
            <h4>My Interests</h4>
          </div>

          <p>
            Areas I enjoy exploring while building my analytical
            and technical foundation.
          </p>

          <div className="feature-tags">

            {interests.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}

          </div>

        </div>

      </div>


      {/* ================= TOOLKIT + CAREER READINESS ================= */}

      <div className="about-bottom-grid">

        {/* TOOLKIT */}

        <div className="about-toolkit reveal">

          <div className="bottom-label">
            MY CURRENT TOOLKIT
          </div>

          <h3>
            Tools I&apos;m using to build my foundation.
          </h3>

          <p>
            I am strengthening my skills by applying these tools
            to real datasets, dashboards and analytical projects.
          </p>

          <div className="toolkit-list">

            {tools.map((tool, index) => (
              <div
                className="toolkit-item"
                key={tool}
              >
                <span>
                  0{index + 1}
                </span>

                <strong>
                  {tool}
                </strong>

                <small>
                  {tool === "MS Excel" && "Data Analysis"}
                  {tool === "SQL" && "Data Queries"}
                  {tool === "Power BI" && "Dashboards"}
                  {tool === "Python" && "Data Processing"}
                </small>
              </div>
            ))}

          </div>

        </div>


        {/* CAREER READINESS */}

        <div className="about-readiness reveal delay-1">

          <div className="readiness-number">PATH</div>

          <div className="bottom-label">
            CAREER READINESS
          </div>

          <h3>
            Learning today.
            <br />
            Preparing for tomorrow.
          </h3>

          <p>
            My current focus is to move from structured learning into measurable professional contribution. I am strengthening data preparation, SQL querying, Excel reporting, Power BI dashboarding and Python-based analysis while building the communication habits required for an analytics team.

            The goal is not simply to collect tools. It is to understand a business question, validate the data, select useful metrics, explain the insight and present a clear next step.
          </p>

          <div className="readiness-line">

            <span>
              Student
            </span>

            <div>
              <i />
              <i />
              <i />
              <i />
            </div>

            <span>
              Data Analyst
            </span>

          </div>

        </div>

      </div>


      {/* ================= PORTFOLIO PURPOSE ================= */}

      <div className="about-purpose reveal">

        <div className="purpose-number">FOCUS</div>

        <div className="purpose-content">

          <span className="bottom-label">
            PURPOSE OF THIS PORTFOLIO
          </span>

          <h3>
            Turning learning into
            <span> practical work.</span>
          </h3>

          <p>
            This portfolio is a collection of my academic learning,
            self-driven projects and technical progress. Instead of
            only listing skills, I want to demonstrate how I apply
            them to solve problems, analyse data and communicate
            insights.
          </p>

        </div>

        <div className="purpose-flow">

          <span>DATA</span>

          <b>→</b>

          <span>ANALYSIS</span>

          <b>→</b>

          <span>INSIGHTS</span>

          <b>→</b>

          <span>DECISIONS</span>

        </div>

      </div>

    </section>
  );
}