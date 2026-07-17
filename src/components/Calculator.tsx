"use client";

import { useState } from "react";
import type { ScoreResult, Source } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { CvUpload } from "./CvUpload";
import { Methodology } from "./Methodology";
import { MilkCarton } from "./MilkCarton";
import { ShareButton } from "./ShareButton";
import { SkillCard } from "./SkillCard";
import { SkillInput } from "./SkillInput";

const CAREER_MAP_URL =
  process.env.NEXT_PUBLIC_CAREER_MAP_URL ?? "https://example.com/career-map";
const CV_REBUILD_URL =
  process.env.NEXT_PUBLIC_CV_REBUILD_URL ?? "https://example.com/cv-rebuild";

interface CalculatorProps {
  sources: Source[];
}

export function Calculator({ sources }: CalculatorProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCalculation = async (skillList: string[]) => {
    if (skillList.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Calculation failed");

      setResult(data);
      trackEvent("calculation_completed", {
        skill_count: skillList.length,
        headline_half_life: data.headline_half_life,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => runCalculation(skills);

  const handleCvSkills = (extracted: string[]) => {
    setSkills(extracted);
    runCalculation(extracted);
  };

  const handleReset = () => {
    setResult(null);
    setSkills([]);
    setError(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-amber-800/10 bg-[#f5f0e8]/80 px-4 py-8 text-center backdrop-blur-sm">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-amber-900/60">
          Best Before
        </p>
        <h1 className="text-4xl font-black text-stone-900 md:text-5xl">
          Skill Half-Life Calculator
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          When do your skills expire? Enter them below — we&apos;ll stamp each one with an expiry
          year and tell you your personal skill half-life.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {!result ? (
          <div className="flex flex-col items-center gap-10">
            <SkillInput
              skills={skills}
              onChange={setSkills}
              onSubmit={handleSubmit}
              loading={loading}
            />
            <div className="flex w-full max-w-2xl items-center gap-4">
              <div className="h-px flex-1 bg-amber-800/20" />
              <span className="text-sm text-stone-500">or</span>
              <div className="h-px flex-1 bg-amber-800/20" />
            </div>
            <CvUpload onSkillsExtracted={handleCvSkills} loading={loading} />
            {error && (
              <p className="text-center text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            <MilkCarton
              halfLife={result.headline_half_life}
              expiryYear={result.expiry_year}
            />

            <ShareButton halfLife={result.headline_half_life} />

            <div className="grid gap-4 sm:grid-cols-2">
              {result.skills.map((skill) => (
                <SkillCard key={skill.input} skill={skill} />
              ))}
            </div>

            {/* CTAs — always end with a next step */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-amber-800/20 bg-[#fffef9] p-8 text-center">
              <h2 className="text-xl font-bold text-stone-800">
                Your skills have a shelf life. Your career doesn&apos;t have to.
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={CAREER_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("cta_career_map_clicked")}
                  className="rounded-full bg-red-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-red-800"
                >
                  See your 2030-proof skill plan
                </a>
                <a
                  href={CV_REBUILD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("cta_cv_rebuild_clicked")}
                  className="rounded-full border-2 border-stone-800 px-8 py-4 text-lg font-semibold text-stone-800 transition hover:bg-stone-100"
                >
                  Rebuild your CV around durable skills
                </a>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-stone-500 underline hover:text-stone-700"
              >
                Start over with different skills
              </button>
            </div>
          </div>
        )}
      </main>

      <Methodology sources={sources} />
    </div>
  );
}
