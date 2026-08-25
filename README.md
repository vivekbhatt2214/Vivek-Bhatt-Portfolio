# Vivek Bhatt — Premium Data Analytics Portfolio

Premium Next.js portfolio with PostgreSQL-backed content management and live visitor analytics.

## Architecture

- Next.js + React + TypeScript
- PostgreSQL with `pg` — **no Prisma**
- PostgreSQL-backed visitor/event analytics
- Secure signed admin session cookie
- Dynamic Projects / Certificates / Resume CMS
- Verified project-file downloads with email OTP
- Request-a-call workflow
- Interview booking workflow
- Optional Vercel Blob direct uploads for large online assets
- Local PostgreSQL file storage fallback for development

## First setup

1. Copy `.env.example` to `.env`.
2. Fill PostgreSQL and admin credentials.
3. Fill Gmail SMTP credentials if email verification is required.
4. Run:

```bash
npm install
npm run dev
```

The application creates its required PostgreSQL tables automatically on first request. Existing `project` records are copied into the new `portfolio_projects` content layer when the new table is empty.

## Admin

- `/admin/login` — secure admin login
- `/admin` — Command Center / live analytics
- `/admin/manage` — Projects, Certificates and Resume Content Studio
- `/admin/activity` — verified downloads and call requests

## Project file uploads

Project files can be `.pbix`, `.xlsx`, `.xls`, `.csv`, `.zip`, PDF and other required formats.

For local development, uploaded files can be stored in PostgreSQL. For production/Vercel, set `NEXT_PUBLIC_USE_BLOB_UPLOAD=true` and `BLOB_READ_WRITE_TOKEN` to use Vercel Blob for large assets while PostgreSQL remains the application/content/analytics backend.

## Security

Never commit `.env`, passwords, Gmail app passwords or database credentials.


## Admin dashboard

The `/admin` Command Center is built to match the supplied dashboard reference:
- fixed top navigation with `VB` branding and portfolio links
- fixed command-center sidebar
- four live KPI cards with data-driven mini line graphs
- eight secondary KPI cards
- visitor activity bar chart, engagement overview and quick actions
- selected portfolio projects and live visitor activity
- automatic 30-second analytics refresh

The analytics values are read from PostgreSQL `analytics_events`; the dashboard does not fabricate visitor totals.

### Database migration safety

`lib/schema.ts` is intentionally idempotent. Legacy foreign keys that point to `portfolio_files` are removed before file-ID columns are normalized, so older `INTEGER`/`BIGINT` installations do not fail with PostgreSQL foreign-key type errors. Failed schema initialization is also retryable without restarting the process.


## Zero-Cost Portfolio Assistant

The public portfolio includes a small floating bilingual (English/Hinglish) portfolio assistant. It uses the existing PostgreSQL/Neon portfolio data and a lightweight server-side intent/search layer, so it does not require OpenAI, Gemini, or another paid AI API key.

The assistant can answer from the current profile, site content, projects and published certifications. No new environment variable is required. Keep the existing `.env` and Vercel environment variables unchanged.
