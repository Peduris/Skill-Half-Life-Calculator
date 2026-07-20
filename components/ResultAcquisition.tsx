"use client";

import { useMemo } from "react";
import type { Verdict } from "@/lib/types";
import { orderedTeasers } from "@/lib/plan";
import { SIGNUP_URL, CREATE_RESUME_URL } from "@/lib/config";
import { track } from "@/lib/analytics";
import PlanTeasers from "./PlanTeasers";

interface Props {
  verdict: Verdict;
}

/**
 * Acquisition block shown right under the half-life number — reactive lead
 * product + full Kickresume teaser grid + account signup.
 */
export default function ResultAcquisition({ verdict }: Props) {
  const teasers = useMemo(() => orderedTeasers(verdict), [verdict]);
  const lead = teasers[0];

  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col gap-5">
      {/* Hot primary CTA — personalized by result */}
      <a
        href={lead.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(lead.event, { from: "result_primary", lead: true, headline: verdict.headlineHalfLife })}
        className="kr-focus group relative block overflow-hidden rounded-[20px] bg-premium-gradient p-5 sm:p-6 text-white shadow-card"
      >
        <span className="inline-flex rounded-pill bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
          Best next step for you
        </span>
        <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold leading-snug">
          {lead.headline}
        </h2>
        <p className="mt-2 text-sm text-white/85 leading-relaxed max-w-xl">{lead.body}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-semibold">
          {lead.cta}
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </a>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={CREATE_RESUME_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_create_resume", { from: "result" })}
          className="kr-focus flex-1 text-center border border-line bg-surface text-ink font-semibold rounded-btn px-5 py-3.5 hover:bg-surface-soft hover:border-line-strong transition-colors"
        >
          Create a free Kickresume resume
        </a>
        <a
          href={SIGNUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_signup", { from: "result" })}
          className="kr-focus flex-1 text-center border border-line bg-surface text-ink font-semibold rounded-btn px-5 py-3.5 hover:bg-surface-soft hover:border-line-strong transition-colors"
        >
          Create free account
        </a>
      </div>

      <div>
        <h3 className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-3">
          More ways Kickresume can help
        </h3>
        <PlanTeasers teasers={teasers} headlineHalfLife={verdict.headlineHalfLife} />
      </div>
    </section>
  );
}
