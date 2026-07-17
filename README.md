# Skill Half-Life Calculator

A playful-morbid web tool that estimates when your professional skills expire — using deterministic scoring backed by WEF 2025, IBM half-life research, and the Lightcast Open Skills taxonomy.

**Domains:** skillhalflife.com / whenwillmyskillsexpire.com

## Features

- **Text input** with autocomplete (local seed CSVs; Lightcast API ready for progressive enhancement)
- **CV upload** (PDF/DOCX) with skill extraction
- **Per-skill cards** with expiry year, trend arrow, and one-liner
- **Headline stat** — weighted-average skill half-life on a milk-carton visual
- **Share card** — OG image via `/api/og?years=3.2`
- **Methodology footer** — citations from `data/sources.csv`
- **Analytics** — Plausible/PostHog + lightweight `/api/analytics` beacon

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: OPENAI_API_KEY for LLM one-liners & CV parsing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scoring methodology

1. **Classify** — fuzzy match against `data/sample_skills_seed.csv`, then keyword/category match against `data/lightcast_category_decay_mapping.csv`
2. **Score** — each skill gets `half_life_years` and `trend` from seed or category tables
3. **Blend** — equal-weighted average (see `src/lib/scoring.ts` for future recency weighting hook)
4. **Honesty layer** — durable human skills pull the average up with inline WEF citations

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | LLM one-liners for unmatched skills; CV skill extraction |
| `NEXT_PUBLIC_SITE_URL` | OG image URL text |
| `NEXT_PUBLIC_CAREER_MAP_URL` | Primary CTA |
| `NEXT_PUBLIC_CV_REBUILD_URL` | Secondary CTA |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics |
| `LIGHTCAST_CLIENT_ID/SECRET` | Future autocomplete enhancement |

## Deploy

Optimized for [Vercel](https://vercel.com):

```bash
npx vercel
```

Set env vars in the Vercel dashboard. The `data/` CSVs are read at build/runtime via `fs` on the server.

## Data

Seed CSVs in `/data/`:

- `lightcast_category_decay_mapping.csv` — 31 Lightcast categories → half-life & trend
- `sample_skills_seed.csv` — ~25 example skills with one-liners
- `wef_skills_2025.csv` — WEF 2025 skill rankings
- `sources.csv` — methodology citations

## Analytics events

- `calculation_started` / `calculation_completed`
- `cv_upload_started` / `cv_upload_completed`
- `share_card_generated`
- `cta_career_map_clicked` / `cta_cv_rebuild_clicked`
