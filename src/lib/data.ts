import fs from "fs";
import path from "path";
import Papa from "papaparse";
import type {
  CategoryDecay,
  SeedSkill,
  Source,
  WefSkill,
} from "./types";

function readCsv<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), "data", filename);
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
  return parsed.data;
}

let categoryCache: CategoryDecay[] | null = null;
let seedCache: SeedSkill[] | null = null;
let wefCache: WefSkill[] | null = null;
let sourcesCache: Source[] | null = null;

export function getCategoryDecay(): CategoryDecay[] {
  if (!categoryCache) {
    categoryCache = readCsv<CategoryDecay>("lightcast_category_decay_mapping.csv");
  }
  return categoryCache;
}

export function getSeedSkills(): SeedSkill[] {
  if (!seedCache) {
    seedCache = readCsv<SeedSkill>("sample_skills_seed.csv");
  }
  return seedCache;
}

export function getWefSkills(): WefSkill[] {
  if (!wefCache) {
    wefCache = readCsv<WefSkill>("wef_skills_2025.csv");
  }
  return wefCache;
}

export function getSources(): Source[] {
  if (!sourcesCache) {
    sourcesCache = readCsv<Source>("sources.csv");
  }
  return sourcesCache;
}

export function getAutocompleteSuggestions(query: string, limit = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seeds = getSeedSkills();
  const matches = seeds
    .filter((s) => s.skill.toLowerCase().includes(q))
    .map((s) => s.skill);

  const categoryKeywords = getCategoryDecay().flatMap((c) =>
    c.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.toLowerCase().includes(q))
  );

  return [...new Set([...matches, ...categoryKeywords])].slice(0, limit);
}
