export default function Education() {
  return (
    <section id="education" className="education-section">
      <div className="education-container">

        {/* ================================
            HEADER
        ================================= */}

        <div className="education-header reveal">

          <div className="education-eyebrow">
            <span className="education-status-dot" />
            Academic journey
          </div>

          <h2>
            From school foundations
            <br />
            <span>to a career in technology.</span>
          </h2>

          <p>
            My academic journey has helped me build a strong foundation
            in computer applications while developing the analytical and
            technical skills I use in my projects today.
          </p>

        </div>


        {/* ================================
            EDUCATION TIMELINE
        ================================= */}

        <div className="education-timeline">


          {/* =================================
              10TH CLASS
          ================================= */}

          <article className="education-item reveal">

            {/* Timeline Number */}

            <div className="education-marker">
              <span>01</span>
            </div>


            {/* Education Card */}

            <div className="education-card">


              {/* Card Top */}

              <div className="education-card-top">


                {/* SCHOOL IMAGE */}

                <div className="education-institution-image">

                  <img
                    src="/education/kv-kausani.jpg"
                    alt="Kendriya Vidyalaya Kausani"
                  />

                </div>


                {/* Year */}

                <div className="education-year">
                  2021
                </div>

              </div>


              {/* Card Content */}

              <div className="education-content">


                {/* Level */}

                <span className="education-level">
                  SECONDARY EDUCATION
                </span>


                {/* Degree / Class */}

                <h3>
                  Class 10th
                </h3>


                {/* Institution */}

                <h4>
                  Kendriya Vidyalaya Kausani
                </h4>


                {/* Meta Information */}

                <div className="education-meta">

                  <span>
                    📍 Bageshwar, Uttarakhand
                  </span>

                  <span>
                    ✓ Completed 2021
                  </span>

                </div>


                {/* Result */}

                <div className="education-result">

                  <div>

                    <small>
                      ACADEMIC SCORE
                    </small>

                    <strong>
                      75.6%
                    </strong>

                  </div>


                  <span className="education-result-badge">
                    10TH
                  </span>

                </div>

              </div>

            </div>

          </article>



          {/* =================================
              12TH CLASS
          ================================= */}

          <article className="education-item reveal delay-1">

            {/* Timeline Number */}

            <div className="education-marker">
              <span>02</span>
            </div>


            {/* Education Card */}

            <div className="education-card">


              {/* Card Top */}

              <div className="education-card-top">


                {/* SCHOOL IMAGE */}

                <div className="education-institution-image">

                  <img
                    src="/education/kv-kausani.jpg"
                    alt="Kendriya Vidyalaya Kausani"
                  />

                </div>


                {/* Year */}

                <div className="education-year">
                  2023
                </div>

              </div>


              {/* Card Content */}

              <div className="education-content">


                {/* Level */}

                <span className="education-level">
                  SENIOR SECONDARY EDUCATION
                </span>


                {/* Class */}

                <h3>
                  Class 12th
                </h3>


                {/* Institution */}

                <h4>
                  Kendriya Vidyalaya Kausani
                </h4>


                {/* Meta Information */}

                <div className="education-meta">

                  <span>
                    📍 Bageshwar, Uttarakhand
                  </span>

                  <span>
                    ✓ Completed 2023
                  </span>

                </div>


                {/* Result */}

                <div className="education-result">

                  <div>

                    <small>
                      ACADEMIC SCORE
                    </small>

                    <strong>
                      87%
                    </strong>

                  </div>


                  <span className="education-result-badge">
                    12TH
                  </span>

                </div>

              </div>

            </div>

          </article>



          {/* =================================
              BCA
          ================================= */}

          <article className="education-item education-current reveal delay-2">

            {/* Timeline Number */}

            <div className="education-marker">
              <span>03</span>
            </div>


            {/* Education Card */}

            <div className="education-card">


              {/* Card Top */}

              <div className="education-card-top">


                {/* COLLEGE IMAGE */}

                <div className="education-institution-image">

                  <img
                    src="/education/dbuu.jpg"
                    alt="Dev Bhoomi Uttarakhand University"
                  />

                </div>


                {/* Current Status */}

                <div className="education-current-badge">
                  COMPLETED
                </div>

              </div>


              {/* Card Content */}

              <div className="education-content">


                {/* Level */}

                <span className="education-level">
                  UNDERGRADUATE DEGREE
                </span>


                {/* Degree */}

                <h3>
                  Bachelor of Computer Applications
                </h3>


                {/* University */}

                <h4>
                  Dev Bhoomi Uttarakhand University
                </h4>


                {/* Meta Information */}

                <div className="education-meta">

                  <span>
                    📍 Dehradun, Uttarakhand, India
                  </span>

                  <span>
                    ✓ 2023 — 2026
                  </span>

                </div>


                {/* Degree Result */}

                <div className="education-result education-degree">


                  {/* CGPA */}

                  <div>

                    <small>
                      CGPA
                    </small>

                    <strong>
                      8.0
                    </strong>

                  </div>


                  {/* Academic Focus */}

                  <div className="degree-focus">

                    <small>
                      ACADEMIC FOCUS
                    </small>

                    <span>
                      Computer Applications
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </article>

        </div>



        {/* ================================
            FOOTER
        ================================= */}

        <div className="education-footer reveal">


          <div className="education-footer-line" />


          <div className="education-footer-content">

            <span>
              LEARNING → BUILDING → GROWING
            </span>

            <p>
              Building practical skills through education,
              projects and continuous learning.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}