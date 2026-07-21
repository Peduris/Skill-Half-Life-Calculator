# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **Next.js 15 (App Router) + React 19 + TypeScript** app (the "Skill Half-Life Calculator"). Package manager is **npm** (`package-lock.json`). There is no database, no Docker, and no separate backend — only the Next.js dev server needs to run.

### Services

| Service | Command | Notes |
| --- | --- | --- |
| Next.js dev server | `npm run dev` | Serves UI + API routes at http://localhost:3000. The core skill-scoring is deterministic and runs client-side, so the app is fully usable with zero env vars/secrets. |

Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`).

### Non-obvious caveats

- **`npm run lint` is not usable non-interactively.** No ESLint config is committed, so `next lint` launches an interactive setup prompt ("How would you like to configure ESLint?") and cannot be answered in a headless environment. Use `npm run build` (which runs `next lint` + type-checking during the build) to validate the code instead. Do not add an ESLint config unless asked.
- **All env vars are optional.** `.env.example` documents optional integrations (Vercel AI Gateway LLM, Lightcast autocomplete, Plausible analytics), each with a deterministic fallback. No secrets are required to run or test the app end-to-end. Copy to `.env.local` only if you want to exercise those optional integrations.
- API routes under `app/api/*` (`share`, `parse-cv`, `one-liner`, `suggest`, `track`, `plan-pdf`) are server-rendered on demand; `/api/track` just structured-logs analytics events (grep `[analytics]`).
