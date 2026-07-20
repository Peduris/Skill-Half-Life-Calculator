import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { computeVerdict, expiryYearFor } from "@/lib/scoring";
import { buildPlan } from "@/lib/plan";
import { SEED_SKILLS } from "@/lib/seed";
import {
  categoryDecayFor,
  allSeedSlugs,
  displayNameFromSlug,
  findSeedBySlug,
  skillSlug,
} from "@/lib/skill-pages";
import { SITE_URL } from "@/lib/config";
import { TREND_COPY } from "@/lib/trends";
import { buildShareImageUrl } from "@/lib/share-url";
import Logo from "@/components/Logo";
import TrendBadge from "@/components/TrendBadge";
import TrackOnce from "@/components/TrackOnce";

type Params = Promise<{ name: string }>;

export function generateStaticParams() {
  return allSeedSlugs().map((name) => ({ name }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { name: raw } = await params;
  const seed = findSeedBySlug(raw);
  const display = seed?.skill_name ?? displayNameFromSlug(raw);
  const verdict = computeVerdict([display]);
  const skill = verdict.skills[0];
  if (!skill) return { title: "Skill not found" };

  const years = skill.half_life_years.toFixed(1);
  const expiry = expiryYearFor(skill, verdict.baselineYear);
  const title = `${display} expires ~${expiry} (${years} yr half-life)`;
  const description = `${TREND_COPY[skill.trend].meaning}. ${skill.one_liner}`;
  const img = buildShareImageUrl({
    years,
    expiry,
    skills: [display],
    growing: skill.trend === "growing" ? 1 : 0,
    stable: skill.trend === "stable" ? 1 : 0,
    declining: skill.trend === "declining" ? 1 : 0,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/skill/${skillSlug(display)}`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export default async function SkillPage({ params }: { params: Params }) {
  const { name: raw } = await params;
  const seed = findSeedBySlug(raw);
  const display = seed?.skill_name ?? displayNameFromSlug(decodeURIComponent(raw));
  const verdict = computeVerdict([display]);
  const skill = verdict.skills[0];
  if (!skill) notFound();

  const plan = buildPlan(verdict);
  const row = plan.rows[0];
  const decay = categoryDecayFor(skill.category);
  const expiry = expiryYearFor(skill, verdict.baselineYear);
  const addHref = `/?add=${encodeURIComponent(skill.input || skill.matchedName)}`;
  const trend = TREND_COPY[skill.trend];

  // Related seed skills in the same category (exclude self).
  const related = SEED_SKILLS.filter(
    (s) =>
      s.lightcast_category === skill.category &&
      skillSlug(s.skill_name) !== skillSlug(skill.matchedName),
  ).slice(0, 6);

  return (
    <main className="min-h-screen flex flex-col bg-surface-soft">
      <TrackOnce
        event="skill_view"
        props={{ skill: skill.matchedName, trend: skill.trend, halfLife: skill.half_life_years }}
      />

      <header className="w-full border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-[64px] flex items-center justify-between gap-3">
          <Logo showByline={false} />
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/compare"
              className="kr-focus rounded-btn text-ink-soft hover:text-ink hover:bg-surface-soft px-3 py-2 transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/"
              className="kr-focus rounded-btn text-ink-soft hover:text-ink hover:bg-surface-soft px-3 py-2 transition-colors"
            >
              Calculator
            </Link>
          </nav>
        </div>
      </header>

      <article className="w-full max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft mb-2">
            Skill half-life · {skill.category}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-strong tracking-tight">
              {skill.matchedName}
            </h1>
            <TrendBadge trend={skill.trend} />
          </div>
          <p className="mt-3 text-ink-soft text-base leading-relaxed">{skill.one_liner}</p>
        </div>

        {/* Key metrics */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric label="Half-life" value={`~${skill.half_life_years} yr`} />
          <Metric label="Best before" value={String(expiry)} accent />
          <Metric label="Trend" value={trend.label} sub={trend.short} />
          <Metric
            label="Match"
            value={
              skill.matchMethod === "seed-exact" || skill.matchMethod === "seed-fuzzy"
                ? "Seed"
                : skill.matchMethod === "keyword-category"
                  ? "Category"
                  : "Estimate"
            }
            sub={`${Math.round(skill.confidence * 100)}% conf.`}
          />
        </section>

        {/* Decay rationale */}
        <section className="bg-surface border border-line rounded-[20px] p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink-strong">Why it decays this way</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {trend.meaning}. Grounded in the Lightcast category mapping and IBM/WEF half-life tiers.
          </p>
          {decay ? (
            <p className="mt-4 text-sm text-ink leading-relaxed border-l-2 border-indigo/40 pl-3">
              {decay.decay_rationale}
            </p>
          ) : (
            <p className="mt-4 text-sm text-ink-soft italic">
              No category-level rationale on file — using the generic {skill.half_life_years}-year
              baseline.
            </p>
          )}
          {skill.citation && (
            <p className="mt-3 text-xs text-ink-soft border-t border-line pt-3">{skill.citation}</p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-soft">Durability tier</dt>
              <dd className="font-semibold text-ink-strong capitalize">
                {decay?.durability_tier ?? "semi-durable"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-soft">Category trend</dt>
              <dd className="font-semibold text-ink-strong capitalize">
                {decay?.trend ?? skill.trend}
              </dd>
            </div>
          </dl>
        </section>

        {/* Recommended pivots / substitutes */}
        <section className="bg-surface border border-line rounded-[20px] p-5 sm:p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink-strong">
            {row.flagged ? "Recommended pivots" : "What eventually replaces it"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            After best-before {expiry}, redirect learning toward WEF-backed differentiators between
            growing and declining roles.
          </p>
          <ul className="mt-4 space-y-3">
            <li className="rounded-card bg-surface-soft p-4">
              <p className="font-semibold text-ink-strong">{row.substitute.skill_name}</p>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{row.substitute.notes}</p>
              <p className="mt-2 text-xs text-ink-soft">
                {row.substitute.differentiator_type} — {row.substitute.source}
              </p>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden rounded-[20px] border border-line bg-surface p-6 sm:p-8 text-center shadow-card">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-premium-gradient" />
          <h2 className="font-display text-xl font-bold text-ink-strong">
            Add {skill.matchedName} to your calculation
          </h2>
          <p className="mt-2 text-sm text-ink-soft max-w-md mx-auto">
            See how this skill moves your personal half-life — and get a 2030-proof plan for your
            full set.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={addHref}
              className="kr-focus inline-flex justify-center bg-premium-gradient text-white font-semibold rounded-btn px-6 py-3.5 hover:opacity-95 transition-opacity shadow-card"
            >
              Add this skill →
            </Link>
            <Link
              href={`/?add=${encodeURIComponent(skill.matchedName)}&compare=1`}
              className="kr-focus inline-flex justify-center border border-line bg-surface text-ink font-semibold rounded-btn px-6 py-3.5 hover:bg-surface-soft transition-colors"
            >
              Compare against a role
            </Link>
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-3">
              Related in {skill.category}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((s) => (
                <li key={s.skill_name}>
                  <Link
                    href={`/skill/${skillSlug(s.skill_name)}`}
                    className="kr-focus inline-flex rounded-pill border border-line bg-surface px-3 py-1.5 text-sm text-ink hover:border-indigo/40 hover:text-indigo transition-colors"
                  >
                    {s.skill_name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-3 text-center ${
        accent ? "bg-primary-tint border-primary/20" : ""
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p
        className={`mt-1 font-display text-lg font-bold ${
          accent ? "text-primary-active" : "text-ink-strong"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-ink-soft mt-0.5">{sub}</p>}
    </div>
  );
}
