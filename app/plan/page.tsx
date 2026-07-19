"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Verdict } from "@/lib/types";
import { loadVerdict, clearVerdict } from "@/lib/result-store";
import { buildPlan, orderedTeasers } from "@/lib/plan";
import { track } from "@/lib/analytics";
import { SITE_URL } from "@/lib/config";
import Logo from "@/components/Logo";
import SkillCard from "@/components/SkillCard";
import Methodology from "@/components/Methodology";
import PlanTimelineCard from "@/components/PlanTimelineCard";
import PlanTeasers from "@/components/PlanTeasers";

export default function PlanPage() {
  const router = useRouter();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const v = loadVerdict();
    setVerdict(v);
    setLoaded(true);
    if (v) track("plan_view", { headline: v.headlineHalfLife, skillCount: v.skills.length }, true);
  }, []);

  const plan = useMemo(() => (verdict ? buildPlan(verdict) : null), [verdict]);
  const teasers = useMemo(() => (verdict ? orderedTeasers(verdict) : []), [verdict]);

  function nav(action: "back" | "home" | "again") {
    track("plan_nav", { action });
    if (action === "again") {
      clearVerdict();
      router.push("/");
    } else if (action === "home") {
      router.push("/");
    } else {
      router.push("/?view=result#result");
    }
  }

  const [pdfBusy, setPdfBusy] = useState(false);

  async function downloadPdf() {
    if (!verdict) return;
    track("plan_pdf_download", { headline: verdict.headlineHalfLife });
    setPdfBusy(true);
    try {
      const skillsParam = encodeURIComponent(verdict.skills.map((s) => s.input).join(","));
      const res = await fetch(`/api/plan-pdf?skills=${skillsParam}`);
      if (!res.ok) throw new Error(`PDF ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `2030-skill-plan-${verdict.headlineHalfLife.toFixed(1)}yr.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Last-resort fallback so the button always does something.
      window.print();
    } finally {
      setPdfBusy(false);
    }
  }

  const siteHost = SITE_URL.replace(/^https?:\/\//, "");

  // Empty state — someone opened /plan directly without a result.
  if (loaded && !verdict) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
        <Logo />
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-bold text-ink-strong">No plan to show yet</h1>
          <p className="mt-2 text-ink-soft">
            Enter your skills first and we&apos;ll build your personalized 2030-proof plan.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="kr-focus bg-premium-gradient text-white font-semibold rounded-btn px-6 py-3 shadow-card hover:opacity-95 transition-opacity"
        >
          Start the calculator →
        </button>
      </main>
    );
  }

  if (!loaded || !verdict || !plan) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-soft text-sm">Building your plan…</p>
      </main>
    );
  }

  const years = plan.headlineHalfLife.toFixed(1);

  return (
    <main className="min-h-screen flex flex-col bg-surface-soft">
      {/* Top bar navigation (chrome — hidden in the PDF) */}
      <header className="plan-chrome w-full border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-[64px] flex items-center justify-between gap-3">
          <Logo showByline={false} />
          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => nav("back")}
              className="kr-focus rounded-btn px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-soft transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => nav("home")}
              className="kr-focus rounded-btn px-3 py-2 text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-soft transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => nav("again")}
              className="kr-focus rounded-btn border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-line-strong hover:bg-surface-soft transition-colors"
            >
              Do it again
            </button>
          </nav>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Restated headline */}
        <section className="text-center">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Your 2030-proof skill plan
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-ink-strong text-balance leading-[1.08]">
            Your skills expire in{" "}
            <span className="text-premium-gradient print-exact">{years} years</span>
            <br className="hidden sm:block" /> — here&apos;s your 2030 plan.
          </h1>
          <p className="mt-4 text-ink-soft text-sm sm:text-base max-w-xl mx-auto">
            A track for every skill you entered, ending at its &ldquo;best before&rdquo; year — with
            grounded pivots where it counts.
          </p>
          <div className="plan-chrome mt-6 flex justify-center">
            <button
              onClick={downloadPdf}
              disabled={pdfBusy}
              className="kr-focus inline-flex items-center gap-2 bg-dark text-white font-semibold rounded-btn px-5 py-3 hover:bg-dark-hover transition-colors shadow-card disabled:opacity-70"
            >
              {pdfBusy ? "Preparing your PDF…" : "↓ Download your plan as PDF"}
            </button>
          </div>
        </section>

        {/* Timeline chart */}
        <PlanTimelineCard plan={plan} />

        {/* Per-skill breakdown */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-4 text-center">
            The full inventory
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {verdict.skills.map((s, i) => (
              <SkillCard key={`${s.input}-${i}`} skill={s} baselineYear={verdict.baselineYear} />
            ))}
          </div>
        </section>

        {/* Kickresume product teasers (chrome — not part of the PDF) */}
        <section className="plan-chrome">
          <div className="mb-4 text-center">
            <h2 className="font-display text-2xl font-bold text-ink-strong">
              Your next move
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Based on your result — reordered to lead with what fits you best.
            </p>
          </div>
          <PlanTeasers teasers={teasers} headlineHalfLife={plan.headlineHalfLife} />
        </section>

        {/* Methodology / sources */}
        <section>
          <Methodology />
        </section>

        {/* Print-only branding footer (baked into the saved PDF) */}
        <div className="plan-print-only text-center text-xs text-ink-soft border-t border-line pt-4">
          <p className="font-semibold text-ink">Skill Half-Life Calculator · by Kickresume</p>
          <p className="mt-1">
            {siteHost} — grounded in WEF Future of Jobs 2025, IBM half-life research &amp; the
            Lightcast taxonomy.
          </p>
        </div>
      </div>

      <footer className="plan-chrome border-t border-line bg-surface">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-xs text-ink-soft max-w-xl">
            Data: WEF Future of Jobs 2025 · IBM IBV · Lightcast Open Skills. Not career advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
