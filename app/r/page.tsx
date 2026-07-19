import type { Metadata } from "next";
import Link from "next/link";
import { computeVerdict } from "@/lib/scoring";
import { buildPlan, orderedTeasers } from "@/lib/plan";
import { SITE_URL } from "@/lib/config";
import Logo from "@/components/Logo";
import SkillCard from "@/components/SkillCard";
import Methodology from "@/components/Methodology";
import PlanTimelineCard from "@/components/PlanTimelineCard";
import PlanTeasers from "@/components/PlanTeasers";
import CopyLinkButton from "@/components/CopyLinkButton";
import TrackOnce from "@/components/TrackOnce";

type SearchParams = Promise<{ skills?: string | string[] }>;

const MAX_SKILLS = 30;

function parseSkills(sp: { skills?: string | string[] }): string[] {
  const raw = Array.isArray(sp.skills) ? sp.skills.join(",") : sp.skills ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SKILLS);
}

function verdictHeadline(years: number): string {
  if (years <= 2.5) return "Handle with care — short shelf life.";
  if (years <= 4.5) return "A respectable shelf life. Keep it refrigerated.";
  if (years <= 7) return "Nicely aged. This holds up.";
  return "Practically non-perishable. Well done.";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const skills = parseSkills(await searchParams);
  if (skills.length === 0) {
    return {
      title: "Shared result — Skill Half-Life Calculator",
      description: "See a shared skill half-life result and calculate your own.",
    };
  }

  const verdict = computeVerdict(skills);
  const years = verdict.headlineHalfLife.toFixed(1);
  const expiry = verdict.headlineExpiryYear;
  const title = `My skills expire in ${years} years — Skill Half-Life Calculator`;
  const preview = skills.slice(0, 6).join(", ") + (skills.length > 6 ? "…" : "");
  const description = `A shared skill half-life result (${preview}). When do yours expire?`;
  const img = `/api/share?years=${years}&expiry=${expiry}`;
  const url = `${SITE_URL}/r?skills=${encodeURIComponent(skills.join(","))}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: img, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export default async function SharedResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const skills = parseSkills(await searchParams);

  // Empty / invalid link — never a dead end.
  if (skills.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
        <Logo />
        <div className="max-w-md">
          <h1 className="font-display text-2xl font-bold text-ink-strong">
            This share link has no skills
          </h1>
          <p className="mt-2 text-ink-soft">
            Calculate your own skill half-life and get a shareable result of your own.
          </p>
        </div>
        <Link
          href="/"
          className="kr-focus bg-premium-gradient text-white font-semibold rounded-btn px-6 py-3 shadow-card hover:opacity-95 transition-opacity"
        >
          Calculate mine →
        </Link>
      </main>
    );
  }

  const verdict = computeVerdict(skills);
  const plan = buildPlan(verdict);
  const teasers = orderedTeasers(verdict);
  const years = verdict.headlineHalfLife.toFixed(1);
  const expiry = verdict.headlineExpiryYear;

  const stats = [
    { label: "Growing", value: verdict.growingCount, cls: "text-grow", tint: "bg-grow-tint" },
    { label: "Stable", value: verdict.stableCount, cls: "text-stable", tint: "bg-stable-tint" },
    { label: "Declining", value: verdict.decliningCount, cls: "text-decline", tint: "bg-decline-tint" },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-surface-soft">
      <TrackOnce event="shared_view" props={{ skillCount: skills.length, headline: verdict.headlineHalfLife }} />

      {/* Top bar */}
      <header className="w-full border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-[64px] flex items-center justify-between gap-3">
          <Logo showByline={false} />
          <Link
            href="/"
            className="kr-focus rounded-btn bg-premium-gradient text-white text-sm font-semibold px-4 py-2 shadow-card hover:opacity-95 transition-opacity"
          >
            Calculate yours →
          </Link>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Shared banner */}
        <p className="text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
          A shared skill half-life result
        </p>

        {/* Headline result card (read-only) */}
        <section className="flex flex-col items-center text-center">
          <div className="relative bg-surface border border-line rounded-[24px] px-6 sm:px-14 pt-10 pb-9 max-w-xl w-full shadow-card overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient" />
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Their personal skill half-life
            </p>
            <div className="mt-3 flex items-end justify-center gap-2">
              <span className="font-display text-7xl sm:text-8xl font-bold text-premium-gradient leading-none">
                {years}
              </span>
              <span className="font-display text-2xl sm:text-3xl font-bold text-ink-soft mb-2">years</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-pill bg-primary-tint px-3.5 py-1.5 text-sm font-semibold text-primary-active">
              Best before {expiry}
            </div>
            <p className="mt-4 text-ink-soft text-sm sm:text-base">
              {verdictHeadline(verdict.headlineHalfLife)}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div key={s.label} className={`flex flex-col items-center rounded-card ${s.tint} py-3`}>
                  <span className={`text-2xl font-bold ${s.cls}`}>{s.value}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <Link
              href="/"
              className="kr-focus flex-1 w-full text-center bg-premium-gradient text-white font-semibold rounded-btn px-6 py-3.5 hover:opacity-95 transition-opacity shadow-card"
            >
              When do yours expire? →
            </Link>
            <div className="flex-1 w-full">
              <CopyLinkButton label="Copy this link" />
            </div>
          </div>
        </section>

        {/* Per-skill cards */}
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

        {/* Their 2030 plan */}
        <section className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-ink-strong">Their 2030-proof plan</h2>
            <p className="mt-1 text-sm text-ink-soft">
              A track for every skill, ending at its best-before year.
            </p>
          </div>
          <PlanTimelineCard plan={plan} />
        </section>

        {/* Teasers */}
        <section>
          <div className="mb-4 text-center">
            <h2 className="font-display text-2xl font-bold text-ink-strong">Level up your own career</h2>
          </div>
          <PlanTeasers teasers={teasers} headlineHalfLife={plan.headlineHalfLife} />
        </section>

        <Methodology />

        {/* Closing CTA */}
        <section className="text-center bg-surface border border-line rounded-[24px] p-8 shadow-card">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-strong text-balance">
            When will <span className="text-premium-gradient">your</span> skills expire?
          </h2>
          <Link
            href="/"
            className="kr-focus mt-5 inline-block bg-premium-gradient text-white font-semibold rounded-btn px-7 py-3.5 shadow-card hover:opacity-95 transition-opacity"
          >
            Calculate my skill half-life →
          </Link>
        </section>
      </div>

      <footer className="border-t border-line bg-surface">
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
