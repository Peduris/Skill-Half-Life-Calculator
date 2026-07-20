"use client";

import { useCallback, useEffect, useState } from "react";
import { computeVerdict } from "@/lib/scoring";
import type { Verdict } from "@/lib/types";
import { loadVerdict, saveVerdict } from "@/lib/result-store";
import SkillInput from "@/components/SkillInput";
import ResultView from "@/components/ResultView";
import Methodology from "@/components/Methodology";
import Logo from "@/components/Logo";

function parseAddParam(): string[] {
  if (typeof window === "undefined") return [];
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get("add") || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Home() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [seedSkills, setSeedSkills] = useState<string[]>([]);
  const [autoCompute, setAutoCompute] = useState(false);

  useEffect(() => {
    const fromUrl = parseAddParam();
    if (fromUrl.length > 0) {
      setSeedSkills(fromUrl);
      setAutoCompute(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      window.history.replaceState({}, "", url.pathname + url.search);
      return;
    }

    const restored = loadVerdict();
    if (!restored) return;
    setVerdict(restored);
    if (window.location.search.includes("view=result")) {
      requestAnimationFrame(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, []);

  const handleCompute = useCallback((skills: string[]) => {
    const v = computeVerdict(skills);
    setVerdict(v);
    saveVerdict(v);
    requestAnimationFrame(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  function reset() {
    setVerdict(null);
    setSeedSkills([]);
    setAutoCompute(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="w-full border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-[68px] flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <a
              href="/compare"
              className="kr-focus rounded-btn text-sm font-medium text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Compare
            </a>
            <a
              href="#methodology"
              className="kr-focus rounded-btn text-sm font-medium text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              Methodology
            </a>
          </nav>
        </div>
      </header>

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

        <SkillInput
          onCompute={handleCompute}
          initialSkills={seedSkills}
          autoCompute={autoCompute}
        />
      </section>

      {verdict && (
        <section id="result" className="px-4 py-10 scroll-mt-24">
          <ResultView verdict={verdict} onReset={reset} />
        </section>
      )}

      <section id="methodology" className="px-4 py-16 border-t border-line bg-surface-soft scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <Methodology />
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-ink-soft">
        Skill Half-Life Calculator · by Kickresume · Not career advice.
      </footer>
    </main>
  );
}
