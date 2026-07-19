import type { ScoredSkill } from "@/lib/types";
import { expiryYearFor } from "@/lib/scoring";
import TrendBadge from "./TrendBadge";

interface Props {
  skill: ScoredSkill;
  baselineYear: number;
}

export default function SkillCard({ skill, baselineYear }: Props) {
  const expiry = expiryYearFor(skill, baselineYear);
  const low = skill.half_life_years <= 2.5;
  const atRisk = skill.trend === "declining" || skill.half_life_years < 3;

  return (
    <div className="bg-surface border border-line rounded-card p-4 flex flex-col gap-3 relative overflow-hidden shadow-card hover:border-line-strong transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink-strong truncate">{skill.input}</h3>
          <p className="text-xs text-ink-soft truncate">{skill.category}</p>
        </div>
        <TrendBadge trend={skill.trend} />
      </div>

      {/* Best-before pill */}
      <div className="flex items-center gap-2.5">
        <div
          className={`text-xs font-semibold rounded-pill px-2.5 py-1 ${
            low ? "bg-decline-tint text-decline" : "bg-surface-soft text-ink-soft"
          }`}
        >
          Best before {expiry}
        </div>
        <span className="text-xs text-ink-soft">
          ~{skill.half_life_years} yr half-life
        </span>
      </div>

      <p className="text-sm text-ink leading-snug">{skill.one_liner}</p>

      {skill.citation && (
        <p
          className={`text-[11px] text-ink-soft border-l-2 pl-2 mt-auto ${
            atRisk ? "border-decline/50" : "border-grow/50"
          }`}
        >
          {skill.citation}
        </p>
      )}
    </div>
  );
}
