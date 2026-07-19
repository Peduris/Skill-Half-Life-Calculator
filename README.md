# Skill Half-Life Calculator

> When will your skills expire? A playful-morbid web tool that gives you your personal **skill half-life** — grounded in the WEF Future of Jobs 2025 report, IBM's skills half-life research, and the Lightcast Open Skills taxonomy.

Enter your skills (or upload a CV) and get:

- A **card per skill** — expiry year, trend arrow (growing / stable / declining), and a one-liner.
- One **headline number** — your weighted-average skill half-life, on a milk-carton / expiry-stamp visual.
- An **auto-generated share image** — "My skills expire in X years. When do yours?" + URL.
- Two **CTAs** — a 2030-proof skill plan and a CV rebuild (stubbed via env vars).
- An always-visible **Methodology & Sources** section, cited verbatim from `data/sources.csv`.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **fuse.js** for fuzzy skill matching (client-side, instant, no backend)
- **next/og** for share-card image generation
- **unpdf** + **mammoth** for CV (PDF / DOCX) text extraction
- Optional: LLM via **Vercel AI Gateway** (one-liners for unknown skills + CV skill extraction) — no provider key required
- Optional: Lightcast Skills API (progressive-enhancement autocomplete)

Deploys free on Vercel. **The core scoring is fully deterministic and runs in the browser** — no LLM or API key required to get a result.

## How scoring works (deterministic)

1. **Classify** each skill → a Lightcast category: fuzzy-match against `sample_skills_seed.csv` first, then keyword/category fallback against `lightcast_category_decay_mapping.csv`.
2. **Score decay**: each match yields a `half_life_years` + `trend`.
3. **Blend**: headline = equal-weighted average of half-lives, rounded to 1 decimal. (Hook for a future recency/seniority weight is marked in `lib/scoring.ts`.)
4. **Honesty layer**: durable human skills surface inline WEF citations so a high number reads as earned.

LLM use is limited to (a) one-liners for skills not in the seed list and (b) CV skill extraction. Both have deterministic fallbacks, so the app works with no key.

## Data

The four researched CSVs live in [`/data`](./data) and are the citable source of truth. They're mirrored as typed constants in `lib/seed.ts` so scoring runs with zero runtime parsing (and client-side).

## Local development

```bash
npm install
cp .env.example .env.local   # optional — app works with defaults
npm run dev                  # http://localhost:3000
```

### Environment variables

All optional — the app runs with sensible defaults. See [`.env.example`](./.env.example).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CAREER_MAP_URL` | Primary CTA destination (stub) |
| `NEXT_PUBLIC_CV_REBUILD_URL` | Secondary CTA destination (stub) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used on the share card + OG tags |
| `AI_GATEWAY_API_KEY` / `AI_GATEWAY_MODEL` | Optional LLM via **Vercel AI Gateway** (one-liners + CV extraction). On Vercel, auth is automatic via OIDC — no key needed. |
| `LIGHTCAST_CLIENT_ID` / `LIGHTCAST_CLIENT_SECRET` | Optional Lightcast autocomplete |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional: also mirror events to Plausible |

> **Lightcast note:** the free tier requires a registration form + email verification before you get a Client ID/Secret (see `data/sources.csv`). Submit it on day 1, but don't block on it — the app ships fully working against the local CSVs, with Lightcast as progressive enhancement.

## Analytics

Self-rolled events cover the four success metrics: `started`, `completed`, `cv_uploaded`, `share_generated`, `cta_career_map`, `cta_cv_rebuild`. Events POST to `/api/track`, which structured-logs them (grep `[analytics]` in Vercel function logs). They're also mirrored to Plausible if configured. Swap the log for a DB insert when you outgrow it.

## Deploy

```bash
npm i -g vercel
vercel        # preview
vercel --prod # production
```

Set the env vars above in the Vercel dashboard (or `vercel env add`).

## Project layout

```
app/
  page.tsx                 # single-page UI orchestrator
  layout.tsx               # metadata + OG tags
  globals.css              # milk-carton / expiry-stamp theme (Tailwind v4)
  api/
    share/route.tsx        # next/og share-card image
    parse-cv/route.ts      # PDF/DOCX -> text -> skills
    one-liner/route.ts     # optional LLM one-liner
    suggest/route.ts       # optional Lightcast autocomplete
    track/route.ts         # analytics sink
components/                # SkillInput, ResultView, SkillCard, TrendBadge, Methodology
lib/
  scoring.ts               # deterministic classify + blend
  seed.ts                  # typed data (mirrors /data CSVs)
  llm.ts / lightcast.ts    # optional integrations (graceful fallback)
data/                      # the four researched CSVs (citable source of truth)
```
