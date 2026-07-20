import Fuse from "fuse.js";
import { SEED_SKILLS } from "./seed";

// Day-one autocomplete source: seed skill names + a few common extras.
const LOCAL_POOL: string[] = Array.from(
  new Set([
    ...SEED_SKILLS.map((s) => s.skill_name),
    "JavaScript",
    "TypeScript",
    "Java",
    "Node.js",
    "Docker",
    "Kubernetes",
    "COBOL",
    "Adobe Flash",
    "Agile / Scrum",
    "Product Management",
    "Digital Marketing",
    "Accounting",
    "Teaching",
    "Negotiation",
    "Recruiting",
    "Bookkeeping",
    "Carpentry",
    "Plumbing",
  ]),
);

const fuse = new Fuse(LOCAL_POOL, {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 1,
});

export function localSuggest(query: string, limit = 6): string[] {
  const q = query.trim();
  if (!q) return [];
  return fuse.search(q).slice(0, limit).map((r) => r.item);
}

export const STARTER_SKILLS = [
  "Python (Programming Language)",
  "React",
  "jQuery",
  "Excel",
  "Leadership",
  "Communication",
  "Data Analysis",
  "Welding",
];
