export type Trend = "growing" | "stable" | "declining";

export interface CategoryDecay {
  category: string;
  half_life_years: number;
  trend: Trend;
  decay_rationale: string;
  keywords: string;
}

export interface SeedSkill {
  skill: string;
  category: string;
  skill_type: string;
  half_life_years: number;
  trend: Trend;
  one_liner: string;
  citation: string;
}

export interface WefSkill {
  skill: string;
  ranking_type: "fastest_growing" | "fastest_declining" | "most_stable";
  rank: number;
  stat_detail: string;
}

export interface Source {
  source_name: string;
  url: string;
  backs_stat: string;
}

export interface ScoredSkill {
  input: string;
  matchedSkill: string;
  category: string;
  skill_type: string;
  half_life_years: number;
  trend: Trend;
  expiry_year: number;
  one_liner: string;
  citation: string;
  matchSource: "seed" | "category" | "fuzzy";
}

export interface ScoreResult {
  skills: ScoredSkill[];
  headline_half_life: number;
  expiry_year: number;
}

export type AnalyticsEvent =
  | "calculation_started"
  | "calculation_completed"
  | "cv_upload_started"
  | "cv_upload_completed"
  | "share_card_generated"
  | "cta_career_map_clicked"
  | "cta_cv_rebuild_clicked";
