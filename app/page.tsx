"use client";

import { useEffect, useState } from "react";
import { computeVerdict } from "@/lib/scoring";
import type { Verdict } from "@/lib/types";
import { loadVerdict, saveVerdict } from "@/lib/result-store";
import SkillInput from "@/components/SkillInput";
import ResultView from "@/components/ResultView";
import Methodology from "@/components/Methodology";
import Logo from "@/components/Logo";

export default function Home() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  // Restore a stored result when returning from /plan (Back / Home), so the
  // results screen is preserved across the route change.
  useEffect(() => {
    const restored = loadVerdict();
    if (!restored) return;
    setVerdict(restored);
    if (typeof window !== "undefined" && window.location.search.includes("view=result")) {
      requestAnimationFrame(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, []);

  function handleCompute(skills: string[]) {
    const v = computeVerdict(skills);
    setVerdict(v);
    saveVerdict(v);
    requestAnimationFrame(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function reset() {
    setVerdict(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-[68px] flex items-center justify-between">
          <Logo />
          <a
            href="#methodology"
            className="kr-focus rounded-btn text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            Methodology
          </a>
        </div>
      </header>

      {/* Hero + input */}
      <section className="px-4 pt-14 pb-8 sm:pt-20">
        <div className="max-w-3xl mx-auto text-center mb-9">
          <div className="inline-flex items-center gap-2 rounded-pill bg-primary-tint px-3.5 py-1.5 text-xs font-semibold text-primary-active mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Best before: sooner than you think
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink-strong text-balance leading-[1.05]">
            When will your skills{" "}
            <span className="text-premium-gradient">expire</span>?
          </h1>
          <p className="mt-5 text-ink-soft text-base sm:text-lg max-w-xl mx-auto text-balance leading-relaxed">
            Enter your skills (or upload your CV) and get your personal{" "}
            <strong className="text-ink">skill half-life</strong> — grounded in the WEF Future of
            Jobs 2025 report, IBM&apos;s half-life research, and the Lightcast taxonomy. Then get a
            plan, not just a verdict.
          </p>
        </div>

        <SkillInput onCompute={handleCompute} />
      </section>

      {/* Results */}
      {verdict && (
        <section id="result" className="px-4 py-10 scroll-mt-24">
          <ResultView verdict={verdict} onReset={reset} />
        </section>
      )}

      {/* Methodology (always on-page) */}
      <section className="px-4 py-12 mt-auto">
        <Methodology />
      </section>

      <footer className="border-t border-line bg-surface-soft">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-xs text-ink-soft max-w-xl">
            Built as a conversation-starter about reskilling. Data: WEF Future of Jobs 2025 · IBM IBV ·
            Lightcast Open Skills. Not career advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
