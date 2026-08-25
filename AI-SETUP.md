# Zero-Cost Portfolio Assistant

The portfolio includes a small floating assistant that works without OpenAI, Gemini, Groq, or any other paid AI API key.

## How it works

The browser calls `/api/ai-chat`. The server reads the public portfolio information already stored in PostgreSQL/Neon (profile, site content, projects and published certifications) and uses a lightweight intent/search layer to produce portfolio-specific answers.

This means:

- No AI API key is required.
- No new paid service is required.
- Existing PostgreSQL/Neon configuration stays unchanged.
- Admin-updated portfolio content can be used by the assistant.
- English and common Hinglish questions are supported.
- The assistant does not expose environment variables, database credentials, admin authentication data or other private implementation details.

## Environment variables

No new environment variable is required for this assistant.

Keep your existing `.env` / Vercel environment variables exactly as they are.

## Local

```bash
npm install
npm run dev
```

## Vercel

Deploy normally. No AI API key needs to be added.
