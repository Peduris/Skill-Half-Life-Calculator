import { SEED_SKILLS } from "./seed";

/**
 * Deterministic, LLM-free skill extraction from CV text. Scans for known seed
 * skills and a curated set of common resume skill terms. Used when no LLM key is
 * configured, or when the LLM call fails.
 */

const COMMON_TERMS: string[] = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
  "React", "Angular", "Vue", "Node.js", "SQL", "PostgreSQL", "MongoDB", "AWS", "Azure",
  "GCP", "Docker", "Kubernetes", "Git", "Machine Learning", "Data Analysis", "Excel",
  "Power BI", "Tableau", "Figma", "Photoshop", "Illustration", "UX/UI Design",
  "Project Management", "Product Management", "Agile", "Scrum", "Leadership",
  "Communication", "Public Speaking", "Copywriting", "Marketing", "SEO", "Sales",
  "Customer Service", "Accounting", "Financial Modeling", "Recruiting", "Teaching",
  "Nursing", "Welding", "Cybersecurity", "Cloud Computing", "Critical Thinking",
  "Negotiation", "Salesforce", "HubSpot", "QuickBooks", "AutoCAD", "SolidWorks",
];

export function extractSkillsFallback(text: string, limit = 15): string[] {
  const haystack = ` ${text.toLowerCase()} `;
  const found = new Map<string, string>();

  const candidates = [
    ...SEED_SKILLS.map((s) => s.skill_name),
    ...COMMON_TERMS,
  ];

  for (const term of candidates) {
    // Match the first parenthesis-free token group for robustness
    // e.g. "Python (Programming Language)" -> also match bare "python".
    const base = term.replace(/\s*\(.*?\)\s*/g, "").trim();
    const needle = base.toLowerCase();
    if (needle.length < 2) continue;
    if (haystack.includes(` ${needle} `) || haystack.includes(`${needle},`) || haystack.includes(`${needle}.`)) {
      const key = base.toLowerCase();
      if (!found.has(key)) found.set(key, base);
    }
    if (found.size >= limit) break;
  }

  return [...found.values()];
}
