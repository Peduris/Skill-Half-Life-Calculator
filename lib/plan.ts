import type { ScoredSkill, Trend, TransitionSkill, Verdict } from "./types";
import { TRANSITION_SKILLS } from "./seed";
import {
  CAREER_MAP_URL,
  JOB_BOARD_URL,
  RESUME_CHECKER_URL,
  RESUME_TAILORING_URL,
  withUtm,
} from "./config";

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
  /**
   * What eventually replaces this skill after its half-life — always assigned
   * (round-robin over WEF differentiators) so the timeline can paint a
   * substitution segment past the expiry marker.
   */
  substitute: TransitionSkill;
  /** Same as `substitute` for at-risk rows; null when nothing is flagged. */
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

  // Round-robin over the 6 WEF differentiators so every skill gets a distinct
  // post-half-life substitution (and at-risk skills still get a clear pivot).
  let cursor = 0;
  const usedPivots: TransitionSkill[] = [];

  const rows: PlanRow[] = verdict.skills.map((s) => {
    const flagged = isFlagged(s);
    const substitute = TRANSITION_SKILLS[cursor % TRANSITION_SKILLS.length]!;
    cursor += 1;
    const pivot = flagged ? substitute : null;
    if (pivot && !usedPivots.some((p) => p.skill_name === pivot.skill_name)) {
      usedPivots.push(pivot);
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
      substitute,
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
    href: CAREER_MAP_URL,
    headline: "See where your durable skills could take you",
    body: "Upload your resume and get a personalized map of career paths — with salary ranges, the skills you already have, and exactly what to learn next for each role.",
    cta: "Explore your Career Map",
    event: "cta_career_map",
  },
  resume_checker: {
    id: "resume_checker",
    href: RESUME_CHECKER_URL,
    headline: "Is your resume keeping up?",
    body: "Get an instant score, see how your resume compares to ones that actually got people hired, and find out exactly what's holding it back.",
    cta: "Check my resume score",
    event: "cta_resume_checker",
  },
  resume_tailoring: {
    id: "resume_tailoring",
    href: RESUME_TAILORING_URL,
    headline: "Got a role in mind for your growing skills?",
    body: "Paste the job ad and let AI rewrite your resume to match it — the right keywords, ATS-friendly formatting, using only what's actually true about you.",
    cta: "Tailor my resume",
    event: "cta_resume_tailoring",
  },
  job_board: {
    id: "job_board",
    href: JOB_BOARD_URL,
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
    order = ["resume_tailoring", "career_map", "resume_checker", "job_board"];
  } else if (verdict.headlineHalfLife >= DURABLE_THRESHOLD) {
    order = ["career_map", "job_board", "resume_checker", "resume_tailoring"];
  } else if (verdict.headlineHalfLife <= 3) {
    // Short shelf life → fix the resume first, then map the path.
    order = ["resume_checker", "resume_tailoring", "career_map", "job_board"];
  } else {
    order = ["resume_checker", "career_map", "resume_tailoring", "job_board"];
  }
  return order.map((id) => ({
    ...PRODUCTS[id],
    href: withUtm(PRODUCTS[id].href, `teaser-${id}`),
  }));
}
