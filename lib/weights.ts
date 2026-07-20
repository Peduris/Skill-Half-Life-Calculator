import type { ScoredSkill, Verdict } from "./types";

/** How the headline half-life blends individual skills. */
export type WeightMode = "equal" | "at-risk-emphasis";

export const WEIGHT_MODE_LABELS: Record<WeightMode, { title: string; hint: string }> = {
  equal: {
    title: "Equal weight",
    hint: "Every skill counts the same in the average.",
  },
  "at-risk-emphasis": {
    title: "Emphasize at-risk skills",
    hint: "Declining & short-lived skills weigh more — so the headline tracks what actually expires first.",
  },
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Per-skill weight for the headline blend.
 * At-risk emphasis: declining / perishable skills pull harder on the average
 * (they're the ones that actually shorten your shelf life).
 */
export function weightForSkill(skill: ScoredSkill, mode: WeightMode): number {
  if (mode === "equal") return 1;
  if (skill.trend === "declining" || skill.half_life_years < 3) return 1.75;
  if (skill.trend === "growing" && skill.half_life_years >= 7) return 0.85;
  return 1;
}

/** Recompute headline fields from an already-scored skill list. */
export function blendHeadline(
  skills: ScoredSkill[],
  baselineYear: number,
  mode: WeightMode = "equal",
): Pick<
  Verdict,
  "headlineHalfLife" | "headlineExpiryYear" | "growingCount" | "stableCount" | "decliningCount"
> {
  if (skills.length === 0) {
    return {
      headlineHalfLife: 5,
      headlineExpiryYear: baselineYear + 5,
      growingCount: 0,
      stableCount: 0,
      decliningCount: 0,
    };
  }

  let weightedSum = 0;
  let totalWeight = 0;
  for (const s of skills) {
    const w = weightForSkill(s, mode);
    weightedSum += s.half_life_years * w;
    totalWeight += w;
  }
  const headlineHalfLife = round1(weightedSum / totalWeight);

  return {
    headlineHalfLife,
    headlineExpiryYear: Math.round(baselineYear + headlineHalfLife),
    growingCount: skills.filter((s) => s.trend === "growing").length,
    stableCount: skills.filter((s) => s.trend === "stable").length,
    decliningCount: skills.filter((s) => s.trend === "declining").length,
  };
}
