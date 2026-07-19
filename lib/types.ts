export type Trend = "growing" | "stable" | "declining";
export type DurabilityTier = "perishable" | "semi-durable" | "durable";
export type SkillType = "specialized" | "common" | "certification";

/** A row from lightcast_category_decay_mapping.csv */
export interface CategoryDecay {
  lightcast_category: string;
  durability_tier: DurabilityTier;
  half_life_years: number;
  trend: Trend;
  decay_rationale: string;
}

/** A row from sample_skills_seed.csv */
export interface SeedSkill {
  skill_name: string;
  lightcast_category: string;
  skill_type: SkillType;
  half_life_years: number;
  trend: Trend;
  one_liner: string;
}

/** A row from wef_skills_2025.csv */
export interface WefSkill {
  skill_name: string;
  wef_status: string;
  wef_rank_2025_2030: number | null;
  notes: string;
  source: string;
}

/** A row from transition_skills.csv — WEF 2025 growing/declining differentiators. */
export interface TransitionSkill {
  skill_name: string;
  differentiator_type: string;
  notes: string;
  source: string;
}

/** A row from sources.csv */
export interface Source {
  source_name: string;
  type: string;
  url: string;
  key_stat_or_use: string;
  accessed: string;
}

/** How a user-entered skill got matched to the decay tables. */
export type MatchMethod = "seed-exact" | "seed-fuzzy" | "keyword-category" | "unmatched";

/** A single scored skill result. */
export interface ScoredSkill {
  input: string;
  matchedName: string;
  category: string;
  half_life_years: number;
  trend: Trend;
  skill_type: SkillType | null;
  one_liner: string;
  /** Inline evidence citation, when the skill maps to a WEF-grounded claim. */
  citation: string | null;
  matchMethod: MatchMethod;
  /** 0..1 confidence in the classification (for UI + telemetry). */
  confidence: number;
  /** True when the one-liner came from the LLM rather than seed/template. */
  oneLinerFromLLM: boolean;
}

/** The full computed verdict returned to the UI. */
export interface Verdict {
  skills: ScoredSkill[];
  /** Weighted-average half-life across all skills, rounded to 1 decimal. */
  headlineHalfLife: number;
  /** The current year used as the expiry baseline. */
  baselineYear: number;
  /** Headline expiry year = baselineYear + headlineHalfLife (rounded). */
  headlineExpiryYear: number;
  growingCount: number;
  stableCount: number;
  decliningCount: number;
}
