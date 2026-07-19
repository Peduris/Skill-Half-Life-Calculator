import type { Verdict } from "./types";
import type { SkillPlan } from "./plan";

/** Short verdict line for the headline number (mirrors the results screen). */
export function verdictHeadline(years: number): string {
  if (years <= 2.5) return "Handle with care — short shelf life.";
  if (years <= 4.5) return "A respectable shelf life. Keep it refrigerated.";
  if (years <= 7) return "Nicely aged. This holds up.";
  return "Practically non-perishable. Well done.";
}

/**
 * Plain-language reasoning for the headline number — why it landed where it did,
 * grounded in the user's own trend mix. Deterministic, no LLM.
 */
export function overallReasoning(verdict: Verdict): string {
  const n = verdict.skills.length;
  const { growingCount: g, stableCount: s, decliningCount: d } = verdict;
  const years = verdict.headlineHalfLife.toFixed(1);

  const mix = `Of your ${n} skill${n === 1 ? "" : "s"}, ${g} ${g === 1 ? "is" : "are"} growing, ${s} stable, and ${d} declining.`;

  let tail: string;
  if (d > 0 && g >= d) {
    tail =
      "Your growing skills are doing the heavy lifting — but the declining ones pull the average down and are the clearest place to act first.";
  } else if (d > 0 && d > g) {
    tail =
      "A meaningful share of your set is fading, which is what shortens the number. Pivoting even one or two toward durable, growing skills would move it materially.";
  } else if (g > s) {
    tail =
      "This set skews toward growing, future-facing skills — the kind that compound rather than expire. Keep feeding them.";
  } else {
    tail =
      "This is a steady, durable set. The move now is to keep it fresh and layer in one or two fast-growing skills to push the number higher.";
  }

  return `Your weighted-average skill half-life is ${years} years. ${mix} ${tail}`;
}

export interface NextMove {
  title: string;
  body: string;
}

/**
 * A prioritized, data-driven action list for the "next move" section — built
 * from the plan's flagged skills, growing skills, and recommended pivots.
 */
export function nextMoves(verdict: Verdict, plan: SkillPlan): NextMove[] {
  const moves: NextMove[] = [];

  const atRisk = plan.rows.filter((r) => r.flagged);
  const growing = verdict.skills.filter((s) => s.trend === "growing");

  if (atRisk.length > 0) {
    const names = atRisk.map((r) => r.input).slice(0, 4).join(", ");
    const pivots = plan.pivots.map((p) => p.skill_name).slice(0, 3).join(", ");
    moves.push({
      title: "1. Shore up your at-risk skills",
      body: `${names} ${atRisk.length === 1 ? "is" : "are"} on a short clock. Redirect learning time toward the WEF-backed differentiators${pivots ? `: ${pivots}` : ""} — the skills that actually separate growing roles from declining ones.`,
    });
  }

  if (growing.length > 0) {
    const names = growing.map((s) => s.input).slice(0, 4).join(", ");
    moves.push({
      title: `${moves.length + 1}. Double down on what's compounding`,
      body: `${names} ${growing.length === 1 ? "is" : "are"} growing. Deepen ${growing.length === 1 ? "it" : "them"} — depth in a rising skill ages far slower than breadth in a fading one.`,
    });
  }

  moves.push({
    title: `${moves.length + 1}. Re-check in 12 months`,
    body: "Skill half-lives move. Re-run your report yearly so your plan tracks the market instead of your memory of it.",
  });

  return moves;
}
