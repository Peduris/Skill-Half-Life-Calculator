"use client";

import type { ScoredSkill } from "@/lib/types";
import { TrendArrow } from "./TrendArrow";

export function SkillCard({ skill }: { skill: ScoredSkill }) {
  return (
    <article className="rounded-xl border-2 border-dashed border-amber-800/30 bg-[#fffef9] p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-stone-800">{skill.matchedSkill}</h3>
          {skill.input !== skill.matchedSkill && (
            <p className="text-xs text-stone-500">matched from &ldquo;{skill.input}&rdquo;</p>
          )}
        </div>
        <TrendArrow trend={skill.trend} />
      </div>

      <div className="mb-3 inline-block rounded border-2 border-red-700/80 bg-red-50 px-3 py-1">
        <span className="text-xs font-bold uppercase tracking-widest text-red-800">
          Best Before
        </span>
        <span className="ml-2 text-xl font-black text-red-700">{skill.expiry_year}</span>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-stone-700 italic">
        &ldquo;{skill.one_liner}&rdquo;
      </p>

      <p className="text-xs text-stone-500 border-t border-stone-200 pt-2">
        <span className="font-medium text-stone-600">{skill.category}</span>
        {" · "}
        {skill.half_life_years.toFixed(1)} yr half-life
        {skill.citation && (
          <>
            {" · "}
            <span title={skill.citation}>{skill.citation.slice(0, 80)}…</span>
          </>
        )}
      </p>
    </article>
  );
}
