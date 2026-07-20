import type { Metadata } from "next";
import Link from "next/link";
import { computeVerdict } from "@/lib/scoring";
import { buildPlan } from "@/lib/plan";
import { SITE_URL } from "@/lib/config";
import { buildShareImageUrl } from "@/lib/share-url";
import { TREND_COPY } from "@/lib/trends";
import { skillSlug } from "@/lib/skill-pages";
import Logo from "@/components/Logo";
import PlanTimeline from "@/components/PlanTimeline";
import TrendStats from "@/components/TrendStats";
import TrackOnce from "@/components/TrackOnce";
import CompareForm from "@/components/CompareForm";

type SearchParams = Promise<{
  a?: string | string[];
  b?: string | string[];
  alabel?: string;
  blabel?: string;
}>;

const MAX = 20;

function parseList(raw: string | string[] | undefined): string[] {
  const s = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, MAX);
}

function deltaCopy(aYears: number, bYears: number, aLabel: string, bLabel: string): string {
  const diff = Math.round((aYears - bYears) * 10) / 10;
  const abs = Math.abs(diff).toFixed(1);
  if (Math.abs(diff) < 0.15) {
    return `${aLabel} and ${bLabel} are essentially tied — within a few months of each other.`;
  }
  if (diff > 0) {
    return `${aLabel} outlasts ${bLabel} by ${abs} years.`;
  }
  return `${bLabel} outlasts ${aLabel} by ${abs} years.`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const a = parseList(sp.a);
  const b = parseList(sp.b);
  if (a.length === 0 || b.length === 0) {
    return {
      title: "Compare skill sets — Skill Half-Life Calculator",
      description: "Put two skill kits side by side and see which one ages better.",
    };
  }
  const va = computeVerdict(a);
  const vb = computeVerdict(b);
  const aLabel = sp.alabel?.trim() || "You";
  const bLabel = sp.blabel?.trim() || "Role";
  const headline = deltaCopy(va.headlineHalfLife, vb.headlineHalfLife, aLabel, bLabel);
  const img = buildShareImageUrl({
    years: va.headlineHalfLife.toFixed(1),
    expiry: va.headlineExpiryYear,
    skills: a.slice(0, 3),
    growing: va.growingCount,
    stable: va.stableCount,
    declining: va.decliningCount,
  });
  return {
    title: headline,
    description: `${aLabel}: ${va.headlineHalfLife.toFixed(1)} yr · ${bLabel}: ${vb.headlineHalfLife.toFixed(1)} yr`,
    openGraph: {
      title: headline,
      description: `${aLabel} vs ${bLabel} skill half-life`,
      url: `${SITE_URL}/compare`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: headline, images: [img] },
  };
}

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const aSkills = parseList(sp.a);
  const bSkills = parseList(sp.b);
  const aLabel = sp.alabel?.trim() || "You";
  const bLabel = sp.blabel?.trim() || "Role";
  const hasBoth = aSkills.length > 0 && bSkills.length > 0;

  if (!hasBoth) {
    return (
      <main className="min-h-screen flex flex-col bg-surface-soft">
        <CompareChrome />
        <div className="max-w-3xl mx-auto px-4 py-12 w-full">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-strong text-center">
            You vs a role
          </h1>
          <p className="mt-3 text-center text-ink-soft max-w-lg mx-auto">
            Paste two skill sets — yours and a job&apos;s — and see which kit ages better through
            2030.
          </p>
          <div className="mt-8">
            <CompareForm
              defaultA={aSkills.join(", ")}
              defaultB={bSkills.join(", ")}
              defaultALabel={aLabel}
              defaultBLabel={bLabel}
            />
          </div>
        </div>
      </main>
    );
  }

  const va = computeVerdict(aSkills);
  const vb = computeVerdict(bSkills);
  const pa = buildPlan(va);
  const pb = buildPlan(vb);
  const headline = deltaCopy(va.headlineHalfLife, vb.headlineHalfLife, aLabel, bLabel);
  const diff = Math.round((va.headlineHalfLife - vb.headlineHalfLife) * 10) / 10;

  return (
    <main className="min-h-screen flex flex-col bg-surface-soft">
      <TrackOnce
        event="compare_view"
        props={{
          aCount: aSkills.length,
          bCount: bSkills.length,
          delta: diff,
          aYears: va.headlineHalfLife,
          bYears: vb.headlineHalfLife,
        }}
      />
      <CompareChrome />

      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8 w-full">
        <section className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Skill set comparison
          </p>
          <h1 className="mt-2 font-display text-2xl sm:text-4xl font-bold text-ink-strong text-balance max-w-3xl mx-auto">
            {headline}
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <DeltaStat label={aLabel} years={va.headlineHalfLife} expiry={va.headlineExpiryYear} lead={diff >= 0} />
            <span className="text-ink-soft font-semibold text-sm uppercase tracking-wide">vs</span>
            <DeltaStat label={bLabel} years={vb.headlineHalfLife} expiry={vb.headlineExpiryYear} lead={diff < 0} />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-5">
          <CompareColumn label={aLabel} verdict={va} plan={pa} skills={aSkills} />
          <CompareColumn label={bLabel} verdict={vb} plan={pb} skills={bSkills} />
        </div>

        <section className="bg-surface border border-line rounded-[20px] p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink-strong mb-3">Edit this comparison</h2>
          <CompareForm
            defaultA={aSkills.join(", ")}
            defaultB={bSkills.join(", ")}
            defaultALabel={aLabel}
            defaultBLabel={bLabel}
          />
        </section>

        <div className="text-center">
          <Link
            href={`/?add=${encodeURIComponent(aSkills.join(","))}`}
            className="kr-focus inline-flex bg-premium-gradient text-white font-semibold rounded-btn px-6 py-3.5 hover:opacity-95 shadow-card"
          >
            Run {aLabel.toLowerCase() === "you" ? "my" : "this"} full 2030 plan →
          </Link>
        </div>
      </div>
    </main>
  );
}

function CompareChrome() {
  return (
    <header className="w-full border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-[64px] flex items-center justify-between gap-3">
        <Logo showByline={false} />
        <Link
          href="/"
          className="kr-focus rounded-btn text-sm font-medium text-ink-soft hover:text-ink hover:bg-surface-soft px-3 py-2 transition-colors"
        >
          Calculator
        </Link>
      </div>
    </header>
  );
}

function DeltaStat({
  label,
  years,
  expiry,
  lead,
}: {
  label: string;
  years: number;
  expiry: number;
  lead: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border px-6 py-4 min-w-[160px] ${
        lead ? "border-indigo/40 bg-surface shadow-card ring-1 ring-indigo/15" : "border-line bg-surface"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="font-display text-3xl font-bold text-premium-gradient leading-none mt-1">
        {years.toFixed(1)}
        <span className="text-lg text-ink-soft ml-1">yr</span>
      </p>
      <p className="text-xs text-ink-soft mt-1">Best before {expiry}</p>
    </div>
  );
}

function CompareColumn({
  label,
  verdict,
  plan,
  skills,
}: {
  label: string;
  verdict: ReturnType<typeof computeVerdict>;
  plan: ReturnType<typeof buildPlan>;
  skills: string[];
}) {
  return (
    <section className="bg-surface border border-line rounded-[20px] p-4 sm:p-5 shadow-card overflow-hidden flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-ink-strong">{label}</h2>
        <p className="text-xs text-ink-soft mt-0.5">
          {skills.length} skill{skills.length === 1 ? "" : "s"} ·{" "}
          {TREND_COPY.growing.label} {verdict.growingCount} · {TREND_COPY.declining.label}{" "}
          {verdict.decliningCount}
        </p>
      </div>
      <TrendStats
        growing={verdict.growingCount}
        stable={verdict.stableCount}
        declining={verdict.decliningCount}
        compact
      />
      <div className="-mx-1">
        <PlanTimeline plan={plan} />
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {verdict.skills.map((s, i) => (
          <li key={`${s.input}-${i}`}>
            <Link
              href={`/skill/${skillSlug(s.matchedName || s.input)}`}
              className="kr-focus inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface-soft px-2.5 py-1 text-xs text-ink hover:border-indigo/40"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  s.trend === "growing"
                    ? "bg-grow"
                    : s.trend === "stable"
                      ? "bg-stable"
                      : "bg-decline"
                }`}
              />
              {s.input}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
