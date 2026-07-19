import type { SkillPlan } from "@/lib/plan";
import PlanTimeline from "./PlanTimeline";

interface Props {
  plan: SkillPlan;
}

/**
 * The timeline card: heading, trend legend, the SVG chart, and the
 * "where to pivot" legend (or an affirming line when nothing is at risk).
 * Pure/server-renderable so it's shared by /plan and the /r permalink.
 */
export default function PlanTimelineCard({ plan }: Props) {
  return (
    <section className="relative bg-surface border border-line rounded-[24px] p-4 sm:p-7 shadow-card overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient print-exact" />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-xl font-bold text-ink-strong">
          {plan.startYear}–{plan.endYear} skill timeline
        </h2>
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-grow print-exact" /> Growing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-stable print-exact" /> Stable
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-decline print-exact" /> Declining
          </span>
        </div>
      </div>

      <PlanTimeline plan={plan} />

      {/* Pivot legend / affirmation — never an empty gap */}
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
                        <span className="text-ink-soft">(best before {r.expiryYear})</span> → pivot to{" "}
                        <strong className="text-ink-strong">{r.pivot!.skill_name}</strong>
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {r.pivot!.notes} <span className="whitespace-nowrap">— {r.pivot!.source}</span>
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-sm text-grow font-semibold">{plan.affirmation}</p>
        )}
      </div>
    </section>
  );
}
