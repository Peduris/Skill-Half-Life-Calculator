import Fuse from "fuse.js";
import { CATEGORY_DECAY, SEED_SKILLS } from "./seed";
import { blendHeadline, type WeightMode } from "./weights";
import type {
  CategoryDecay,
  ScoredSkill,
  SeedSkill,
  Trend,
  Verdict,
} from "./types";

export type { WeightMode };

/**
 * Keyword -> Lightcast category map. Used only as a *fallback* when a user's
 * skill string doesn't fuzzy-match a seed skill. Intentionally coarse: the real
 * defense against garbage input is constrained/autocompleted entry, not a
 * cleverer matcher (see PROJECT non-goals).
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Information Technology": [
    "software", "developer", "programming", "code", "coding", "javascript", "typescript",
    "java", "c++", "c#", "golang", "rust", "php", "ruby", "node", "angular", "vue", "svelte",
    "docker", "kubernetes", "devops", "aws", "azure", "gcp", "cloud", "linux", "api",
    "backend", "frontend", "full stack", "database", "nosql", "mongodb", "postgres",
    "cybersecurity", "security", "network", "it support", "sysadmin", "data engineering",
    "machine learning", "ai", "artificial intelligence", "deep learning", "nlp", "data science",
    "html", "css", "git", "tensorflow", "pytorch", "computer",
  ],
  Analysis: [
    "analysis", "analytics", "analytical", "data analysis", "business intelligence", "bi",
    "statistics", "statistical", "reporting", "tableau", "power bi", "critical thinking",
    "problem solving", "research analyst", "quantitative",
  ],
  Engineering: [
    "engineering", "mechanical", "electrical", "civil", "structural", "aerospace",
    "chemical engineer", "hardware", "cad", "solidworks", "robotics", "automation engineer",
  ],
  Design: [
    "design", "ux", "ui", "user experience", "user interface", "figma", "sketch", "adobe xd",
    "graphic design", "illustration", "product design", "visual design", "typography",
  ],
  Business: [
    "business", "management", "strategy", "operations", "excel", "spreadsheet",
    "project management", "product management", "consulting", "entrepreneur", "planning",
    "microsoft office", "powerpoint", "word",
  ],
  "Marketing and Public Relations": [
    "marketing", "seo", "sem", "content marketing", "social media", "brand", "advertising",
    "public relations", "pr", "growth", "email marketing", "campaign", "google ads",
  ],
  "Media and Communications": [
    "communication", "communications", "writing", "copywriting", "content", "journalism",
    "editing", "public speaking", "presentation", "storytelling", "video", "podcast",
  ],
  Sales: [
    "sales", "selling", "account executive", "business development", "cold calling",
    "negotiation", "crm", "salesforce", "lead generation", "prospecting",
  ],
  Finance: [
    "finance", "financial", "accounting", "bookkeeping", "audit", "tax", "investment",
    "banking", "financial modeling", "budgeting", "cfa", "cpa", "quickbooks",
  ],
  "Human Resources": [
    "human resources", "hr", "recruiting", "recruitment", "talent", "people ops",
    "onboarding", "compensation", "employee relations", "leadership", "coaching", "mentoring",
  ],
  "Health Care": [
    "nursing", "nurse", "clinical", "medical", "healthcare", "health care", "patient",
    "physician", "doctor", "pharmacy", "therapy", "physical therapy", "dental", "surgery",
  ],
  "Law, Regulation, and Compliance": [
    "law", "legal", "compliance", "regulatory", "regulation", "paralegal", "attorney",
    "gdpr", "soc2", "governance", "risk", "contract",
  ],
  "Education and Training": [
    "teaching", "teacher", "education", "training", "instructional design", "curriculum",
    "tutoring", "e-learning", "professor", "learning and development", "lifelong learning",
  ],
  Administration: [
    "administration", "administrative", "admin", "clerical", "data entry", "secretary",
    "office administration", "receptionist", "scheduling", "filing",
  ],
  "Customer and Client Support": [
    "customer service", "customer support", "client support", "help desk", "support",
    "call center", "service orientation", "customer success",
  ],
  "Personal Care and Services": [
    "personal care", "caregiving", "childcare", "cosmetology", "hairdressing", "beauty",
    "fitness", "personal trainer", "spa",
  ],
  "Social and Human Services": [
    "social work", "counseling", "social services", "case management", "community",
    "nonprofit", "empathy", "active listening", "advocacy",
  ],
  "Performing Arts, Sports, and Recreation": [
    "performing arts", "acting", "music", "dance", "theater", "sports", "coaching sports",
    "recreation", "athletics", "choreography",
  ],
  "Physical and Inherent Abilities": [
    "manual dexterity", "typing", "physical", "endurance", "precision", "assembly line",
    "hand-eye", "stamina",
  ],
  "Maintenance, Repair, and Facility Services": [
    "maintenance", "repair", "hvac", "plumbing", "electrician", "facilities", "janitorial",
    "mechanic", "technician",
  ],
  "Manufacturing and Production": [
    "manufacturing", "production", "welding", "machining", "assembly", "fabrication",
    "cnc", "quality control", "lean", "six sigma",
  ],
  "Transportation, Supply Chain, and Logistics": [
    "logistics", "supply chain", "transportation", "warehouse", "shipping", "trucking",
    "driving", "inventory", "procurement", "fleet",
  ],
  "Energy and Utilities": [
    "energy", "utilities", "renewable", "solar", "wind", "power plant", "oil and gas",
    "electrical grid", "ev", "battery",
  ],
  Environment: [
    "environment", "environmental", "sustainability", "climate", "conservation",
    "ecology", "waste management", "carbon", "esg",
  ],
  "Agriculture, Horticulture, and Landscaping": [
    "agriculture", "farming", "horticulture", "landscaping", "gardening", "crops",
    "livestock", "agronomy",
  ],
  "Architecture and Construction": [
    "architecture", "construction", "carpentry", "masonry", "surveying", "building",
    "estimating", "project engineering construction", "autocad",
  ],
  "Property and Real Estate": [
    "real estate", "property management", "leasing", "appraisal", "realtor", "broker",
  ],
  "Public Safety and National Security": [
    "public safety", "law enforcement", "police", "firefighting", "military", "defense",
    "security clearance", "emergency", "national security",
  ],
  "Science and Research": [
    "science", "research", "laboratory", "lab", "biology", "chemistry", "physics",
    "scientist", "r&d", "clinical research", "experiment",
  ],
  "Economics, Policy, and Social Studies": [
    "economics", "policy", "public policy", "political science", "sociology", "history",
    "geography", "econometrics",
  ],
  "Hospitality and Food Services": [
    "hospitality", "food service", "culinary", "chef", "cooking", "restaurant", "barista",
    "hotel", "catering", "bartending",
  ],
};

/**
 * Honesty layer: inline, evidence-based citations for skills whose durability is
 * a *claim we should back up*. Keyed by Lightcast category. Surfacing these makes
 * a high half-life read as earned, not hand-wavy.
 *
 * POSITIVE citations are shown for durable/growing skills. They must NOT appear
 * under a "this is dead" verdict — see `citationFor` for the trend-aware pick.
 */
const GROWTH_CITATIONS: Record<string, string> = {
  "Media and Communications":
    "Communication shows near-zero GenAI substitution potential (WEF Future of Jobs 2025).",
  "Human Resources":
    "Leadership & Social Influence rose +22pp — the largest increase of any skill (WEF 2025).",
  "Social and Human Services":
    "Empathy & Active Listening: zero GenAI substitution potential (WEF 2025).",
  "Customer and Client Support":
    "Service Orientation is the most stable, least-substitutable core skill (WEF 2025).",
  Analysis:
    "Analytical Thinking is the #1 core skill today — 70% of employers (WEF 2025).",
  Environment:
    "Environmental Stewardship posted the largest net increase of any industry skill (WEF 2025).",
  "Education and Training":
    "Curiosity & Lifelong Learning is a top-10 fastest-growing skill (WEF 2025).",
  "Information Technology":
    "AI & Big Data, Cybersecurity and Tech Literacy are the top-3 fastest-growing skills — demand rises even as specific tools churn (WEF 2025).",
};

/**
 * DECLINE/perishable citations, used when a skill is declining OR short-lived
 * (half-life < 3yr) — so the evidence matches the "this is fading" verdict
 * instead of contradicting it (e.g. jQuery under an IT growth citation).
 */
const DECLINE_CITATIONS: Record<string, string> = {
  "Information Technology":
    "Named tools & frameworks churn fast — IBM pegs technical-skill half-life at ~2.5 years, so a specific stack dates quickly even as IT overall grows (IBM IBV; WEF 2025).",
  "Physical and Inherent Abilities":
    "Manual Dexterity, Endurance & Precision is the ONLY skill category with a true net decline — 24% of employers (WEF 2025).",
  Administration:
    "Clerical & administrative roles are among the fastest-declining jobs (WEF 2025).",
  "Manufacturing and Production":
    "Routine production & quality-control tasks are among the skills with the largest projected demand decline (WEF 2025).",
};

const GENERIC_DECLINE_CITATION =
  "IBM pegs specialized/technical skills at a ~2.5-year half-life — the fastest-decaying skill class, so this one needs regular refreshing to stay current (IBM IBV).";

const fuse = new Fuse<SeedSkill>(SEED_SKILLS, {
  keys: ["skill_name"],
  includeScore: true,
  threshold: 0.42,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

const categoryByName: Record<string, CategoryDecay> = Object.fromEntries(
  CATEGORY_DECAY.map((c) => [c.lightcast_category, c]),
);

const DEFAULT_CATEGORY: CategoryDecay = {
  lightcast_category: "General Professional",
  durability_tier: "semi-durable",
  half_life_years: 5,
  trend: "stable",
  decay_rationale:
    "Unmatched skill — defaults to IBM's ~5yr general-skill baseline until classified.",
};

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

const trendPhrase: Record<Trend, string> = {
  growing: "in-demand and climbing",
  stable: "holding steady",
  declining: "on the way out",
};

/** Deterministic, LLM-free fallback one-liner in the house voice. */
function templateOneLiner(category: string, trend: Trend, halfLife: number): string {
  if (trend === "declining") {
    return `Best-before is getting close — this one's ${trendPhrase[trend]}. Roughly a ${halfLife}-year shelf life before a refresh is overdue.`;
  }
  if (trend === "growing") {
    return `Good news: ${trendPhrase[trend]}. Keep it fresh and it'll carry you a solid ${halfLife} years.`;
  }
  return `${category} skills like this are ${trendPhrase[trend]} — expect around a ${halfLife}-year shelf life.`;
}

/**
 * Trend-aware citation: keep the evidence consistent with the verdict. A skill
 * that's declining or short-lived gets a decline/perishable citation; a durable
 * one gets the positive growth citation (or none).
 */
function citationFor(category: string, trend: Trend, halfLife: number): string | null {
  const atRisk = trend === "declining" || halfLife < 3;
  if (atRisk) return DECLINE_CITATIONS[category] ?? GENERIC_DECLINE_CITATION;
  return GROWTH_CITATIONS[category] ?? null;
}

/** Classify + score a single user-entered skill string. Pure & deterministic. */
export function scoreSkill(input: string): ScoredSkill {
  const raw = input.trim();
  const norm = normalize(raw);

  // 1) Try seed-skill match (exact, then fuzzy).
  const exact = SEED_SKILLS.find((s) => normalize(s.skill_name) === norm);
  if (exact) {
    return {
      input: raw,
      matchedName: exact.skill_name,
      category: exact.lightcast_category,
      half_life_years: exact.half_life_years,
      trend: exact.trend,
      skill_type: exact.skill_type,
      one_liner: exact.one_liner,
      citation: citationFor(exact.lightcast_category, exact.trend, exact.half_life_years),
      matchMethod: "seed-exact",
      confidence: 1,
      oneLinerFromLLM: false,
    };
  }

  const fuzzy = fuse.search(raw);
  if (fuzzy.length > 0 && fuzzy[0].score !== undefined && fuzzy[0].score <= 0.42) {
    const s = fuzzy[0].item;
    return {
      input: raw,
      matchedName: s.skill_name,
      category: s.lightcast_category,
      half_life_years: s.half_life_years,
      trend: s.trend,
      skill_type: s.skill_type,
      one_liner: s.one_liner,
      citation: citationFor(s.lightcast_category, s.trend, s.half_life_years),
      matchMethod: "seed-fuzzy",
      confidence: Math.max(0.55, 1 - fuzzy[0].score),
      oneLinerFromLLM: false,
    };
  }

  // 2) Fall back to keyword -> category matching against the decay table.
  const category = matchCategory(norm);
  if (category) {
    return {
      input: raw,
      matchedName: raw,
      category: category.lightcast_category,
      half_life_years: category.half_life_years,
      trend: category.trend,
      skill_type: null,
      one_liner: templateOneLiner(category.lightcast_category, category.trend, category.half_life_years),
      citation: citationFor(category.lightcast_category, category.trend, category.half_life_years),
      matchMethod: "keyword-category",
      confidence: 0.6,
      oneLinerFromLLM: false,
    };
  }

  // 3) Unmatched -> neutral baseline (never blocks a result).
  return {
    input: raw,
    matchedName: raw,
    category: DEFAULT_CATEGORY.lightcast_category,
    half_life_years: DEFAULT_CATEGORY.half_life_years,
    trend: DEFAULT_CATEGORY.trend,
    skill_type: null,
    one_liner: templateOneLiner("General professional", "stable", DEFAULT_CATEGORY.half_life_years),
    citation: null,
    matchMethod: "unmatched",
    confidence: 0.3,
    oneLinerFromLLM: false,
  };
}

function matchCategory(norm: string): CategoryDecay | null {
  let best: { category: string; weight: number } | null = null;
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        // Longer keyword hits are stronger signals than short ones.
        const weight = kw.length;
        if (!best || weight > best.weight) {
          best = { category, weight };
        }
      }
    }
  }
  if (best) return categoryByName[best.category] ?? null;

  // Last try: does the input literally contain a category name?
  for (const c of CATEGORY_DECAY) {
    if (norm.includes(normalize(c.lightcast_category))) return c;
  }
  return null;
}

/**
 * Blend individual skill scores into the headline verdict.
 *
 * Modes:
 * - equal (default): each skill counts once
 * - at-risk-emphasis: declining / short-lived skills weigh more so the
 *   headline tracks what actually shortens your shelf life
 */
export function computeVerdict(
  inputs: string[],
  opts?: { baselineYear?: number; weightMode?: WeightMode },
): Verdict {
  const year = opts?.baselineYear ?? new Date().getFullYear();
  const mode = opts?.weightMode ?? "equal";
  const cleaned = inputs.map((s) => s.trim()).filter(Boolean);
  const skills = cleaned.map(scoreSkill);
  const headline = blendHeadline(skills, year, mode);

  return {
    skills,
    baselineYear: year,
    ...headline,
  };
}

/** Re-blend an existing verdict under a different weight mode (no re-scoring). */
export function reweightVerdict(verdict: Verdict, weightMode: WeightMode): Verdict {
  return {
    ...verdict,
    ...blendHeadline(verdict.skills, verdict.baselineYear, weightMode),
  };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function expiryYearFor(skill: ScoredSkill, baselineYear: number): number {
  return Math.round(baselineYear + skill.half_life_years);
}
