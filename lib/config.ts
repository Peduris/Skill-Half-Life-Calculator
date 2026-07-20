/** Centralized access to public runtime config (all inlined at build time). */

const KR = "https://www.kickresume.com";

/** Append acquisition UTMs so Kickresume can attribute calculator traffic. */
export function withUtm(
  url: string,
  content: string,
  campaign = "skill-half-life",
): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "skill-half-life");
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "calculator");
    if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", campaign);
    u.searchParams.set("utm_content", content);
    return u.toString();
  } catch {
    return url;
  }
}

export const SIGNUP_URL = withUtm(
  process.env.NEXT_PUBLIC_SIGNUP_URL || `${KR}/register/`,
  "signup",
);

export const CREATE_RESUME_URL = withUtm(
  process.env.NEXT_PUBLIC_CREATE_RESUME_URL || `${KR}/dashboard/create-resume/`,
  "create-resume",
);

export const CAREER_MAP_URL = withUtm(
  process.env.NEXT_PUBLIC_CAREER_MAP_URL || `${KR}/en/ai-career-map/`,
  "career-map",
);

export const CV_REBUILD_URL = withUtm(
  process.env.NEXT_PUBLIC_CV_REBUILD_URL || `${KR}/en/ai-career-map/`,
  "cv-rebuild",
);

export const RESUME_CHECKER_URL = withUtm(
  process.env.NEXT_PUBLIC_RESUME_CHECKER_URL || `${KR}/en/resume-checker/`,
  "resume-checker",
);

export const RESUME_TAILORING_URL = withUtm(
  process.env.NEXT_PUBLIC_RESUME_TAILORING_URL || `${KR}/en/resume-tailoring/`,
  "resume-tailoring",
);

export const JOB_BOARD_URL = withUtm(
  process.env.NEXT_PUBLIC_JOB_BOARD_URL || `${KR}/jobs/`,
  "job-board",
);

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://skill-half-life-calculator.vercel.app"
).replace(/\/$/, "");

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "";

export const SITE_NAME = "Skill Half-Life Calculator";
export const SITE_TAGLINE = "When will your skills expire?";
