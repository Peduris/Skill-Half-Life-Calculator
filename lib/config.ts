/** Centralized access to public runtime config (all inlined at build time). */

export const CAREER_MAP_URL =
  process.env.NEXT_PUBLIC_CAREER_MAP_URL || "https://example.com/career-map";

export const CV_REBUILD_URL =
  process.env.NEXT_PUBLIC_CV_REBUILD_URL || "https://www.kickresume.com/en/ai-career-map/";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://skillhalflife.com"
).replace(/\/$/, "");

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";

export const SITE_NAME = "Skill Half-Life Calculator";
export const SITE_TAGLINE = "When will your skills expire?";
