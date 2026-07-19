import { generateText } from "ai";
import { SEED_SKILLS } from "./seed";
import type { Trend } from "./types";

/**
 * LLM helper routed through the **Vercel AI Gateway** (no direct OpenAI key).
 *
 * Auth is handled automatically:
 *   - On Vercel deployments: OIDC (VERCEL_OIDC_TOKEN) — zero config, auto-refreshed.
 *   - Locally: `vercel env pull` provisions VERCEL_OIDC_TOKEN, or set AI_GATEWAY_API_KEY.
 *
 * The app stays fully functional without the gateway — every caller must provide
 * a deterministic fallback and treat the LLM as a progressive enhancement.
 */

// Plain "provider/model" string auto-routes through the AI Gateway.
// Default is a small, fast, cheap model that's comfortable on the free tier and
// nails the house voice. Override with AI_GATEWAY_MODEL (e.g. openai/gpt-5.4).
const MODEL = process.env.AI_GATEWAY_MODEL || "anthropic/claude-haiku-4.5";

export function llmEnabled(): boolean {
  // On Vercel, the AI Gateway authenticates via a request-scoped OIDC token that
  // the AI SDK resolves at call time (not always visible on process.env), so we
  // optimistically enable when running on Vercel. A static AI_GATEWAY_API_KEY or
  // a locally-pulled VERCEL_OIDC_TOKEN also enable it. Every call has a
  // deterministic fallback, so an optimistic "true" can never break the app.
  return Boolean(
    process.env.AI_GATEWAY_API_KEY ||
      process.env.VERCEL_OIDC_TOKEN ||
      process.env.VERCEL,
  );
}

async function complete(
  system: string,
  prompt: string,
  opts: { temperature?: number; maxOutputTokens?: number } = {},
): Promise<string | null> {
  if (!llmEnabled()) return null;
  try {
    const { text } = await generateText({
      model: MODEL,
      system,
      prompt,
      temperature: opts.temperature ?? 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 400,
      // Never let a slow model hang the request.
      abortSignal: AbortSignal.timeout(15_000),
    });
    return text?.trim() || null;
  } catch (err) {
    console.error(
      `[llm] gateway call failed (model=${MODEL}):`,
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );
    return null;
  }
}

// Few-shot examples drawn straight from the seed one-liners (the house voice).
const FEWSHOT = SEED_SKILLS.slice(0, 8)
  .map((s) => `- ${s.skill_name} (${s.trend}, ${s.half_life_years}yr): ${s.one_liner}`)
  .join("\n");

const ONE_LINER_SYSTEM = `You write one-line verdicts for a playful web tool called the Skill Half-Life Calculator.

VOICE: playful-morbid. Think expiry stamps, "best before" labels, milk cartons. Wry, warm, never bleak or mocking. Never say someone's career is over.

RULES:
- Exactly ONE sentence, max ~22 words.
- No emojis. No hashtags. No quotation marks around the output.
- Ground it in the given trend (growing/stable/declining) and half-life.
- Match the register of these examples:
${FEWSHOT}`;

/** Generate a single one-liner for an unknown skill. Returns null on any failure. */
export async function generateOneLiner(
  skill: string,
  category: string,
  trend: Trend,
  halfLife: number,
): Promise<string | null> {
  const out = await complete(
    ONE_LINER_SYSTEM,
    `Skill: ${skill}\nLightcast category: ${category}\nTrend: ${trend}\nHalf-life: ${halfLife} years\n\nWrite the one-liner.`,
    { temperature: 0.9, maxOutputTokens: 80 },
  );
  if (!out) return null;
  // Strip stray wrapping quotes/markdown the model sometimes adds.
  return out.replace(/^["'`\-\s]+|["'`\s]+$/g, "").split("\n")[0].slice(0, 240);
}

const CV_SYSTEM = `You extract a concise, deduplicated list of professional SKILLS from resume/CV text.

RULES:
- Return ONLY a JSON array of strings, e.g. ["Python","Project Management","SQL"].
- 5 to 20 skills max. Prefer concrete, resume-grade skills (tools, disciplines, competencies).
- Normalize casing (e.g. "python" -> "Python"). No duplicates. No sentences, no soft filler.
- If the text has almost no skills, return the best few you can find.`;

/** Extract a skill list from raw CV text via LLM. Returns null on any failure. */
export async function extractSkillsFromCV(text: string): Promise<string[] | null> {
  const clipped = text.slice(0, 12_000);
  const out = await complete(
    CV_SYSTEM,
    `CV text:\n"""\n${clipped}\n"""\n\nReturn the JSON array of skills.`,
    { temperature: 0.2, maxOutputTokens: 400 },
  );
  if (!out) return null;
  try {
    const match = out.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : out);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((x): x is string => typeof x === "string")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);
    }
  } catch {
    /* fall through */
  }
  return null;
}
