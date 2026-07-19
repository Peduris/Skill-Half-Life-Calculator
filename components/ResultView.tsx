"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ScoredSkill, Verdict } from "@/lib/types";
import { CV_REBUILD_URL } from "@/lib/config";
import { track } from "@/lib/analytics";
import { saveVerdict } from "@/lib/result-store";
import { copyToClipboard } from "@/lib/clipboard";
import SkillCard from "./SkillCard";

interface Props {
  verdict: Verdict;
  onReset: () => void;
}

function verdictHeadline(years: number): string {
  if (years <= 2.5) return "Handle with care — short shelf life.";
  if (years <= 4.5) return "A respectable shelf life. Keep it refrigerated.";
  if (years <= 7) return "Nicely aged. This holds up.";
  return "Practically non-perishable. Well done.";
}

export default function ResultView({ verdict, onReset }: Props) {
  const router = useRouter();
  const [skills, setSkills] = useState<ScoredSkill[]>(verdict.skills);
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const years = verdict.headlineHalfLife.toFixed(1);
  const expiry = verdict.headlineExpiryYear;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareImageUrl = `${origin}/api/share?years=${years}&expiry=${expiry}`;
  // Permalink that re-renders this exact result from the URL (closes the viral
  // loop — the shared link opens a real result, not the homepage).
  const skillsParam = encodeURIComponent(verdict.skills.map((s) => s.input).join(","));
  const shareUrl = `${origin}/r?skills=${skillsParam}`;
  const shareText = `My skills expire in ${years} years. When do yours?`;
  const shareBlob = `${shareText} ${shareUrl}`;

  // Fire the completion event once when results render.
  useEffect(() => {
    track(
      "completed",
      {
        headline: verdict.headlineHalfLife,
        skillCount: verdict.skills.length,
        growing: verdict.growingCount,
        declining: verdict.decliningCount,
      },
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progressive enhancement: upgrade template one-liners via the LLM (if enabled).
  useEffect(() => {
    let cancelled = false;
    const toEnhance = verdict.skills
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.matchMethod === "keyword-category" || s.matchMethod === "unmatched");

    if (toEnhance.length === 0) return;

    (async () => {
      for (const { s, i } of toEnhance) {
        try {
          const res = await fetch("/api/one-liner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              skill: s.input,
              category: s.category,
              trend: s.trend,
              halfLife: s.half_life_years,
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          if (cancelled || !data?.oneLiner) continue;
          setSkills((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], one_liner: data.oneLiner, oneLinerFromLLM: true };
            return next;
          });
        } catch {
          /* keep template */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToPlan() {
    // Persist the *enhanced* verdict (LLM one-liners included) so /plan renders
    // the exact same data the user is looking at.
    saveVerdict({ ...verdict, skills });
    track("view_plan", { headline: verdict.headlineHalfLife, skillCount: skills.length });
    router.push("/plan");
  }

  async function copyShare() {
    const ok = await copyToClipboard(shareBlob);
    if (ok) {
      setManualCopy(false);
      setCopied(true);
      track("share_generated", { method: "copy_text" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      // Clipboard blocked (insecure context / webview) — reveal a selectable
      // field so the user can copy manually.
      setManualCopy(true);
      track("share_generated", { method: "copy_manual_fallback" });
    }
  }

  async function downloadImage() {
    if (downloading) return;
    setDownloading(true);
    track("share_generated", { method: "download" });
    try {
      const res = await fetch(shareImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skill-half-life-${years}yr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(shareImageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  const stats = useMemo(
    () => [
      { label: "Growing", value: verdict.growingCount, cls: "text-grow", tint: "bg-grow-tint" },
      { label: "Stable", value: verdict.stableCount, cls: "text-stable", tint: "bg-stable-tint" },
      { label: "Declining", value: verdict.decliningCount, cls: "text-decline", tint: "bg-decline-tint" },
    ],
    [verdict],
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-10">
      {/* Headline result card */}
      <section className="flex flex-col items-center text-center">
        <div className="relative bg-surface border border-line rounded-[24px] px-6 sm:px-14 pt-10 pb-9 max-w-xl w-full shadow-card overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient" />
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Your personal skill half-life
          </p>
          <div className="mt-3 flex items-end justify-center gap-2">
            <span className="font-display text-7xl sm:text-8xl font-bold text-premium-gradient animate-pop leading-none">
              {years}
            </span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-ink-soft mb-2">years</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-primary-tint px-3.5 py-1.5 text-sm font-semibold text-primary-active">
            Best before {expiry}
          </div>
          <p className="mt-4 text-ink-soft text-sm sm:text-base">{verdictHeadline(verdict.headlineHalfLife)}</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className={`flex flex-col items-center rounded-card ${s.tint} py-3`}>
                <span className={`text-2xl font-bold ${s.cls}`}>{s.value}</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-soft mt-3 max-w-md">
          Weighted average across {verdict.skills.length} skill
          {verdict.skills.length === 1 ? "" : "s"}. One decimal place — precision is part of the joke.
        </p>
      </section>

      {/* CTAs — always a next step, never a bare number */}
      <section id="next-steps" className="scroll-mt-24 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={goToPlan}
          className="kr-focus text-center bg-premium-gradient text-white font-semibold rounded-btn px-6 py-4 hover:opacity-95 transition-opacity shadow-card"
        >
          See your 2030-proof skill plan →
        </button>
        <a
          href={CV_REBUILD_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("cta_cv_rebuild", { headline: verdict.headlineHalfLife })}
          className="kr-focus text-center border border-line bg-surface text-ink font-semibold rounded-btn px-6 py-4 hover:bg-surface-soft hover:border-line-strong transition-colors"
        >
          Rebuild your CV around durable skills
        </a>
      </section>

      {/* Per-skill cards */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-4 text-center">
          The full inventory
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <SkillCard key={`${s.input}-${i}`} skill={s} baselineYear={verdict.baselineYear} />
          ))}
        </div>
      </section>

      {/* Share card */}
      <section className="bg-surface-soft border border-line rounded-[24px] p-5 sm:p-7">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-4 text-center">
          Share your expiry date
        </h2>
        <div className="flex flex-col lg:flex-row gap-5 items-center">
          {/* Reserve the 40:21 aspect box so layout never jumps while the image loads. */}
          <div className="relative w-full max-w-md aspect-[40/21] overflow-hidden rounded-card border border-line shadow-card bg-surface-soft">
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-surface-muted" aria-hidden />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shareImageUrl}
              alt={`Share card: skills expire in ${years} years`}
              width={480}
              height={252}
              onLoad={() => setImgLoaded(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={downloadImage}
              disabled={downloading}
              aria-busy={downloading}
              className="kr-focus inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-btn px-5 py-3 hover:bg-primary-hover active:bg-primary-active transition-colors shadow-card disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  />
                  Preparing…
                </>
              ) : (
                "↓ Download share image"
              )}
            </button>
            <button
              onClick={copyShare}
              className="kr-focus border border-line bg-surface rounded-btn px-5 py-3 font-semibold text-ink hover:bg-surface-soft hover:border-line-strong transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy share text + link"}
            </button>
            {manualCopy && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-decline">
                  Couldn&apos;t access your clipboard — select and copy this:
                </label>
                <input
                  readOnly
                  value={shareBlob}
                  onFocus={(e) => e.currentTarget.select()}
                  className="kr-focus w-full rounded-btn border border-line bg-surface-soft px-3 py-2 text-xs text-ink"
                />
              </div>
            )}
            <p className="text-xs text-ink-soft">“{shareText}”</p>
          </div>
        </div>
      </section>

      {/* Copy confirmation toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-btn bg-ink-strong px-4 py-2.5 text-sm font-medium text-white shadow-card transition-all duration-200 ${
          copied ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        ✓ Copied to clipboard
      </div>

      <div className="text-center">
        <button onClick={onReset} className="kr-focus rounded-btn text-sm font-medium text-ink-soft hover:text-primary transition-colors">
          ← Start over with different skills
        </button>
      </div>
    </div>
  );
}
