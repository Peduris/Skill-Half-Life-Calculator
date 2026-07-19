import type { ScoredSkill, Trend, TransitionSkill, Verdict } from "./types";
import { TRANSITION_SKILLS } from "./seed";

/**
 * Deterministic model behind the "Your 2030-Proof Skill Plan" subpage.
 *
 * Everything here is a pure function of the user's own scored Verdict — no
 * templates, no example state. The same input always yields the same plan, and
 * every possible result (1 skill or 20, all durable or all perishable) produces
 * a complete, non-empty plan.
 */

export interface PlanRow {
  input: string;
  category: string;
  trend: Trend;
  halfLifeYears: number;
  /**
   * Expiry position on the x-axis, expressed in whole years from the baseline
   * and derived from `expiryYear` (NOT the raw half-life) so the visual marker
   * lands exactly on the same year tick as the "best before" label.
   */
  expiryPoint: number;
  /** Rounded calendar year the skill "expires". */
  expiryYear: number;
  flagged: boolean;
  /** Assigned WEF differentiator to pivot toward (only for flagged rows). */
  pivot: TransitionSkill | null;
}

export interface SkillPlan {
  baselineYear: number;
  /** Number of years the x-axis spans (5..10). */
  span: number;
  startYear: number;
  endYear: number;
  headlineHalfLife: number;
  rows: PlanRow[];
  /** Distinct transition skills recommended across all flagged rows. */
  pivots: TransitionSkill[];
  flaggedCount: number;
  /** Copy shown when there is nothing to pivot from. */
  affirmation: string | null;
}

/** A skill is "at risk" (gets a pivot flag) if it's declining or very short-lived. */
export function isFlagged(skill: Pick<ScoredSkill, "trend" | "half_life_years">): boolean {
  return skill.trend === "declining" || skill.half_life_years < 3;
}

export function buildPlan(verdict: Verdict): SkillPlan {
  const baselineYear = verdict.baselineYear;
  const maxHalfLife = verdict.skills.reduce((m, s) => Math.max(m, s.half_life_years), 0);

  // X-axis: now .. now + N, where N = clamp(ceil(max half-life), 5, 10).
  const span = Math.max(5, Math.min(10, Math.ceil(maxHalfLife) || 5));
  const startYear = baselineYear;
  const endYear = baselineYear + span;

  // Round-robin (least-recently-used) cursor over the 6 WEF differentiators, so
  // multiple at-risk skills don't all get the same pivot unless there are more
  // than six of them.
  let cursor = 0;
  const usedPivots: TransitionSkill[] = [];

  const rows: PlanRow[] = verdict.skills.map((s) => {
    const flagged = isFlagged(s);
    let pivot: TransitionSkill | null = null;
    if (flagged && TRANSITION_SKILLS.length > 0) {
      pivot = TRANSITION_SKILLS[cursor % TRANSITION_SKILLS.length];
      cursor += 1;
      if (!usedPivots.some((p) => p.skill_name === pivot!.skill_name)) {
        usedPivots.push(pivot);
      }
    }
    const expiryYear = Math.round(baselineYear + s.half_life_years);
    return {
      input: s.input,
      category: s.category,
      trend: s.trend,
      halfLifeYears: s.half_life_years,
      // Snap to the rounded year so marker position == label year.
      expiryPoint: expiryYear - baselineYear,
      expiryYear,
      flagged,
      pivot,
    };
  });

  const flaggedCount = rows.filter((r) => r.flagged).length;

  let affirmation: string | null = null;
  if (flaggedCount === 0) {
    affirmation =
      rows.length === 1
        ? "Nothing to pivot from here — this one's aging well."
        : "No pivots needed. Your skill set is aging gracefully — keep compounding it.";
  }

  return {
    baselineYear,
    span,
    startYear,
    endYear,
    headlineHalfLife: verdict.headlineHalfLife,
    rows,
    pivots: usedPivots,
    flaggedCount,
    affirmation,
  };
}

/* ------------------------------------------------------------------ */
/* Kickresume product teasers — reordered by the user's own result.   */
/* ------------------------------------------------------------------ */

export type ProductId = "career_map" | "resume_checker" | "resume_tailoring" | "job_board";

export interface ProductTeaser {
  id: ProductId;
  href: string;
  headline: string;
  body: string;
  cta: string;
  /** Analytics event fired on click. */
  event:
    | "cta_career_map"
    | "cta_resume_checker"
    | "cta_resume_tailoring"
    | "cta_job_board";
}

const PRODUCTS: Record<ProductId, ProductTeaser> = {
  career_map: {
    id: "career_map",
    href: "https://www.kickresume.com/en/ai-career-map/",
    headline: "See where your durable skills could take you",
    body: "Upload your resume and get a personalized map of career paths — with salary ranges, the skills you already have, and exactly what to learn next for each role.",
    cta: "Explore your Career Map",
    event: "cta_career_map",
  },
  resume_checker: {
    id: "resume_checker",
    href: "https://www.kickresume.com/en/resume-checker/",
    headline: "Is your resume keeping up?",
    body: "Get an instant score, see how your resume compares to ones that actually got people hired, and find out exactly what's holding it back.",
    cta: "Check my resume score",
    event: "cta_resume_checker",
  },
  resume_tailoring: {
    id: "resume_tailoring",
    href: "https://www.kickresume.com/en/resume-tailoring/",
    headline: "Got a role in mind for your growing skills?",
    body: "Paste the job ad and let AI rewrite your resume to match it — the right keywords, ATS-friendly formatting, using only what's actually true about you.",
    cta: "Tailor my resume",
    event: "cta_resume_tailoring",
  },
  job_board: {
    id: "job_board",
    href: "https://www.kickresume.com/jobs/",
    headline: "Ready to put your skills to work?",
    body: "Browse open roles that match what you're good at right now — no need to wait until your skills fully \u201cexpire\u201d to make a move.",
    cta: "Browse jobs",
    event: "cta_job_board",
  },
};

/** Threshold (years) above which a skill set counts as "durable" for teaser ordering. */
const DURABLE_THRESHOLD = 7;

/**
 * All four teasers, always shown, reordered to lead with the most relevant
 * next step for this user's result.
 */
export function orderedTeasers(verdict: Verdict): ProductTeaser[] {
  let order: ProductId[];
  if (verdict.decliningCount > 0) {
    // Skills worth repositioning → lead with tailoring, then the career map.
    order = ["resume_tailoring", "career_map", "resume_checker", "job_board"];
  } else if (verdict.headlineHalfLife >= DURABLE_THRESHOLD) {
    // Durable set → show how far it can take them, then live roles.
    order = ["career_map", "job_board", "resume_checker", "resume_tailoring"];
  } else {
    // Mixed/default → the safe universal next step.
    order = ["resume_checker", "career_map", "resume_tailoring", "job_board"];
  }
  return order.map((id) => PRODUCTS[id]);
}
