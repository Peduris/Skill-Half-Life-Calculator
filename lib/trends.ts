import type { Trend } from "./types";

/** Plain-language meaning for the Growing / Stable / Declining counters. */
export const TREND_COPY: Record<
  Trend,
  { label: string; meaning: string; short: string }
> = {
  growing: {
    label: "Growing",
    meaning: "Demand for this skill will keep growing",
    short: "Will keep growing",
  },
  stable: {
    label: "Stable",
    meaning: "Demand stays about the same — not rising, not fading",
    short: "Stays the same",
  },
  declining: {
    label: "Declining",
    meaning: "Demand is fading — this skill is heading toward obsolete",
    short: "Becoming obsolete",
  },
};

export const TREND_ORDER: Trend[] = ["growing", "stable", "declining"];
