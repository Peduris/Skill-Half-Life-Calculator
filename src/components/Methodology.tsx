"use client";

import type { Source } from "@/lib/types";

export function Methodology({ sources }: { sources: Source[] }) {
  return (
    <footer id="methodology" className="mt-16 border-t-2 border-dashed border-amber-800/20 bg-[#faf7f2] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-2xl font-bold text-stone-800">Methodology & Sources</h2>
        <p className="mb-6 text-sm text-stone-600">
          This tool uses deterministic scoring — not a horoscope. Skills are classified via the
          Lightcast Open Skills taxonomy, assigned half-life values from WEF 2025 and IBM research,
          then blended into your headline number.
        </p>

        <ol className="mb-8 list-decimal space-y-2 pl-5 text-sm text-stone-700">
          <li>
            <strong>Classify:</strong> Fuzzy match against seed skills, then keyword/category match
            against 31 Lightcast categories.
          </li>
          <li>
            <strong>Score:</strong> Each skill gets a half-life (years) and trend from our decay
            tables.
          </li>
          <li>
            <strong>Blend:</strong> Your headline number is an equal-weighted average (recency
            weighting noted for future).
          </li>
          <li>
            <strong>Honesty layer:</strong> Durable human skills (leadership, communication) pull the
            average up with WEF citations inline.
          </li>
        </ol>

        <h3 className="mb-4 text-lg font-semibold text-stone-800">Citations</h3>
        <ul className="space-y-3">
          {sources.map((source) => (
            <li key={source.url} className="text-sm">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-900 underline hover:text-amber-700"
              >
                {source.source_name}
              </a>
              <p className="mt-0.5 text-stone-600">{source.backs_stat}</p>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
