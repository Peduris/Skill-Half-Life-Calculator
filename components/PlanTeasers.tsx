"use client";

import type { ProductTeaser } from "@/lib/plan";
import { track } from "@/lib/analytics";

interface Props {
  teasers: ProductTeaser[];
  headlineHalfLife: number;
}

export default function PlanTeasers({ teasers, headlineHalfLife }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {teasers.map((t, i) => {
        const lead = i === 0;
        return (
          <a
            key={t.id}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(t.event, { from: "plan", lead, headline: headlineHalfLife })}
            className={`kr-focus group relative flex flex-col rounded-[20px] border p-5 sm:p-6 transition-colors overflow-hidden ${
              lead
                ? "border-transparent bg-surface shadow-card ring-1 ring-indigo/25"
                : "border-line bg-surface hover:border-line-strong hover:bg-surface-soft"
            }`}
          >
            {lead && <div className="absolute inset-x-0 top-0 h-1 bg-premium-gradient" />}
            {lead && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-pill bg-primary-tint px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-active">
                Best next step for you
              </span>
            )}
            <h3 className="font-display text-lg font-bold text-ink-strong leading-snug">
              {t.headline}
            </h3>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{t.body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary group-hover:text-primary-active transition-colors">
              {t.cta}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
