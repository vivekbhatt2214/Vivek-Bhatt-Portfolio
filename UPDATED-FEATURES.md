# Portfolio update notes

This copy preserves the existing project structure, public assets, `.env`, and PostgreSQL-backed content model. The changes add/fix:

- Admin activity View / Edit / Delete / Reply actions.
- Styled delete confirmation modal instead of the browser `confirm()` dialog.
- Contact and interview reply history in the admin panel.
- Gmail threading headers (`In-Reply-To` / `References`) when the original owner-notification Message-ID is available.
- Original contact/interview notification Message-ID storage for future replies.
- Google-avatar-first sender avatar lookup with Gravatar fallback; initials remain the final fallback.
- Phone-number copy action for call requests.
- Profile DP upload + remove control from Content Studio.
- Dynamic DP/name/headline in the portfolio navbar and admin navbar.
- Admin controls for Hero, About, Skills, Education, Experience, Contact and Footer content.
- Existing dedicated Projects, Certificates and Resume editors remain available.
- Interview booking slots: 9:00 AM–9:00 PM, 30-minute blocks (last slot 8:30–9:00 PM).
- Same-day interview slots at or before the current India time are disabled client-side and rejected server-side.
- Existing colors/design are preserved; responsive and interaction animations remain enabled.

## Validation

`git diff --check` passes for the updated working tree. A full `npm ci` / production build could not be completed in this isolated environment because dependency installation timed out; therefore no false claim of a successful production build is made.

## Environment and data

The existing `.env` file was not changed. Its SHA-256 before/after is identical in the working copy.

PostgreSQL records are not duplicated into this ZIP because the application stores them in the configured PostgreSQL database. The database connection settings and schema migration logic remain in the project so the existing database continues to be used.

- Added a small floating bilingual (English/Hinglish) portfolio assistant that uses the existing PostgreSQL/Neon portfolio data without requiring an AI API key.
- Removed the OpenAI API dependency from the assistant route; no new environment variable is required.
- Fixed email avatar provider: Google public profile-photo endpoint is tried first; generic Google-favicon avatar is no longer used.
