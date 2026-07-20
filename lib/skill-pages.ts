import { CATEGORY_DECAY, SEED_SKILLS } from "./seed";
import type { CategoryDecay, SeedSkill } from "./types";

/** URL-safe slug for `/skill/[name]` pages. */
export function skillSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Find a seed skill by its slug (exact match on slugified name). */
export function findSeedBySlug(slug: string): SeedSkill | null {
  const target = skillSlug(slug);
  return SEED_SKILLS.find((s) => skillSlug(s.skill_name) === target) ?? null;
}

/** Resolve a display name from a slug, preferring the canonical seed name. */
export function displayNameFromSlug(slug: string): string {
  const seed = findSeedBySlug(slug);
  if (seed) return seed.skill_name;
  // Decode hyphenated slugs into a readable guess for unscored inputs.
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function categoryDecayFor(category: string): CategoryDecay | null {
  return CATEGORY_DECAY.find((c) => c.lightcast_category === category) ?? null;
}

/** All seed slugs — used by `generateStaticParams`. */
export function allSeedSlugs(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of SEED_SKILLS) {
    const slug = skillSlug(s.skill_name);
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}
