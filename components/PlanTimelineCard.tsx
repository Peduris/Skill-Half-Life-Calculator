import type { SkillPlan } from "@/lib/plan";
import { TREND_COPY, TREND_ORDER } from "@/lib/trends";
import PlanTimeline from "./PlanTimeline";

interface Props {
  plan: SkillPlan;
}

const DOT: Record<string, string> = {
  growing: "bg-grow",
  stable: "bg-stable",
  declining: "bg-decline",
};

/**
 * The timeline card: heading, trend legend with meanings, the SVG chart
 * (live skill + post-half-life substitution), and the pivot list.
 */
export default function PlanTimelineCard({ plan }: Props) {
  return (
    <section className="relative bg-surface border border-line rounded-[24px] p-4 sm:p-7 shadow-card overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient print-exact" />
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-strong">
            {plan.startYear}–{plan.endYear} skill timeline
          </h2>
          <p className="mt-1 text-xs text-ink-soft max-w-md">
            Colored track = your skill until its half-life. Grey-blue track = what eventually
            replaces it after that.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2 text-xs text-ink-soft">
          {TREND_ORDER.map((t) => (
            <span key={t} className="inline-flex flex-col gap-0.5" title={TREND_COPY[t].meaning}>
              <span className="inline-flex items-center gap-1.5 font-medium text-ink">
                <span className={`h-2.5 w-2.5 rounded-full print-exact ${DOT[t]}`} />
                {TREND_COPY[t].label}
              </span>
              <span className="pl-4 text-[10px] leading-tight">{TREND_COPY[t].short}</span>
            </span>
          ))}
          <span className="inline-flex flex-col gap-0.5" title="Skill that takes over after the half-life">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink">
              <span
                className="h-2.5 w-2.5 rounded-full print-exact"
                style={{ background: "#c5c9e8", boxShadow: "inset 0 0 0 1px #666cff" }}
              />
              Substitution
            </span>
            <span className="pl-4 text-[10px] leading-tight">Replaces it after expiry</span>
          </span>
        </div>
      </div>

      <PlanTimeline plan={plan} />

      <div className="mt-5 border-t border-line pt-5">
        {plan.flaggedCount > 0 ? (
          <>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-3">
              Where to pivot
            </h3>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {plan.rows
                .filter((r) => r.flagged && r.pivot)
                .map((r, i) => (
                  <li
                    key={`${r.input}-${i}`}
                    className="flex items-start gap-3 rounded-card bg-surface-soft p-3"
                  >
                    <span
                      className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold print-exact"
                      style={{ background: "var(--color-decline)" }}
                      aria-hidden
                    >
                      ⚑
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-ink">
                        <strong className="text-ink-strong">{r.input}</strong>{" "}
                        <span className="text-ink-soft">(best before {r.expiryYear})</span> →
                        replaced by{" "}
                        <strong className="text-ink-strong">{r.pivot!.skill_name}</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {r.pivot!.notes}{" "}
                        <span className="whitespace-nowrap">— {r.pivot!.source}</span>
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-3 text-center">
              After each half-life
            </h3>
            <p className="text-center text-sm text-grow font-semibold mb-3">{plan.affirmation}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.rows.map((r, i) => (
                <li
                  key={`${r.input}-sub-${i}`}
                  className="rounded-card bg-surface-soft px-3 py-2 text-sm text-ink"
                >
                  <strong className="text-ink-strong">{r.input}</strong>
                  <span className="text-ink-soft"> → </span>
                  <span className="font-medium text-indigo">{r.substitute.skill_name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
