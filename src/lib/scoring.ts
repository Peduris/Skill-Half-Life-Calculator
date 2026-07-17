import Fuse from "fuse.js";
import { getCategoryDecay, getSeedSkills } from "./data";
import type { ScoreResult, ScoredSkill, Trend } from "./types";

const FUZZY_THRESHOLD = 0.4;

function normalizeSkill(input: string): string {
  return input.trim().toLowerCase();
}

function matchBySeed(input: string): ScoredSkill | null {
  const seeds = getSeedSkills();
  const normalized = normalizeSkill(input);

  const exact = seeds.find((s) => normalizeSkill(s.skill) === normalized);
  if (exact) {
    return buildScoredSkill(input, exact.skill, exact.category, exact.skill_type, exact.half_life_years, exact.trend, exact.one_liner, exact.citation, "seed");
  }

  const fuse = new Fuse(seeds, {
    keys: ["skill"],
    threshold: FUZZY_THRESHOLD,
    includeScore: true,
  });
  const result = fuse.search(input)[0];
  if (result && result.score !== undefined && result.score <= FUZZY_THRESHOLD) {
    const s = result.item;
    return buildScoredSkill(input, s.skill, s.category, s.skill_type, s.half_life_years, s.trend, s.one_liner, s.citation, "fuzzy");
  }

  return null;
}

function matchByCategory(input: string): ScoredSkill | null {
  const categories = getCategoryDecay();
  const normalized = normalizeSkill(input);

  for (const cat of categories) {
    const keywords = cat.keywords.split(",").map((k) => k.trim().toLowerCase());
    if (
      keywords.some((k) => normalized.includes(k) || k.includes(normalized)) ||
      normalizeSkill(cat.category).includes(normalized) ||
      normalized.includes(normalizeSkill(cat.category).split(" ")[0])
    ) {
      const oneLiner = generateFallbackOneLiner(input, cat.trend, cat.half_life_years);
      const citation = cat.decay_rationale;
      return buildScoredSkill(
        input,
        input,
        cat.category,
        "inferred",
        cat.half_life_years,
        cat.trend,
        oneLiner,
        citation,
        "category"
      );
    }
  }

  const fuse = new Fuse(categories, {
    keys: ["keywords", "category"],
    threshold: 0.5,
  });
  const result = fuse.search(input)[0];
  if (result) {
    const cat = result.item;
    return buildScoredSkill(
      input,
      input,
      cat.category,
      "inferred",
      cat.half_life_years,
      cat.trend,
      generateFallbackOneLiner(input, cat.trend, cat.half_life_years),
      cat.decay_rationale,
      "category"
    );
  }

  return null;
}

function buildScoredSkill(
  input: string,
  matchedSkill: string,
  category: string,
  skill_type: string,
  half_life_years: number,
  trend: Trend,
  one_liner: string,
  citation: string,
  matchSource: ScoredSkill["matchSource"]
): ScoredSkill {
  const currentYear = new Date().getFullYear();
  return {
    input,
    matchedSkill,
    category,
    skill_type,
    half_life_years,
    trend,
    expiry_year: Math.round(currentYear + half_life_years),
    one_liner,
    citation,
    matchSource,
  };
}

function generateFallbackOneLiner(skill: string, trend: Trend, halfLife: number): string {
  const templates: Record<Trend, string[]> = {
    growing: [
      `${skill}: riding the wave — but waves crash. Refresh in ~${halfLife.toFixed(1)} years.`,
      `Hot skill, melting clock. ${skill} has about ${halfLife.toFixed(1)} good years left.`,
    ],
    stable: [
      `${skill}: not flashy, not expired. Solid until ${new Date().getFullYear() + Math.round(halfLife)}.`,
      `Slow decay, steady value. Your ${skill} skills age gracefully.`,
    ],
    declining: [
      `${skill}: the sell-by date is approaching. Plan your pivot.`,
      `Best enjoyed before ${new Date().getFullYear() + Math.round(halfLife)}. After that, it's vintage.`,
    ],
  };
  const options = templates[trend];
  return options[Math.abs(skill.length) % options.length];
}

export function scoreSkill(input: string): ScoredSkill {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Empty skill");
  }

  const seedMatch = matchBySeed(trimmed);
  if (seedMatch) return seedMatch;

  const categoryMatch = matchByCategory(trimmed);
  if (categoryMatch) return categoryMatch;

  // Default fallback: generic IT-ish assumption
  const currentYear = new Date().getFullYear();
  return {
    input: trimmed,
    matchedSkill: trimmed,
    category: "Information Technology",
    skill_type: "unknown",
    half_life_years: 4.0,
    trend: "stable",
    expiry_year: currentYear + 4,
    one_liner: `We couldn't pin down ${trimmed} — giving it a cautious 4-year shelf life. Add a clearer skill name?`,
    citation: "Default estimate based on IBM half-life research for unspecified technical skills.",
    matchSource: "category",
  };
}

// Equal weighting for MVP; recency/seniority weight could be added here later.
export function scoreSkills(inputs: string[]): ScoreResult {
  const unique = [...new Set(inputs.map((s) => s.trim()).filter(Boolean))];
  const skills = unique.map(scoreSkill);

  const headline_half_life =
    skills.reduce((sum, s) => sum + s.half_life_years, 0) / skills.length;

  const currentYear = new Date().getFullYear();

  return {
    skills,
    headline_half_life: Math.round(headline_half_life * 10) / 10,
    expiry_year: Math.round(currentYear + headline_half_life),
  };
}
