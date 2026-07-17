"use client";

import type { Trend } from "@/lib/types";

const trendConfig: Record<
  Trend,
  { arrow: string; label: string; color: string }
> = {
  growing: { arrow: "↗", label: "Growing", color: "text-emerald-600" },
  stable: { arrow: "→", label: "Stable", color: "text-amber-600" },
  declining: { arrow: "↘", label: "Declining", color: "text-red-600" },
};

export function TrendArrow({ trend }: { trend: Trend }) {
  const config = trendConfig[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${config.color}`}
      title={config.label}
    >
      <span className="text-lg" aria-hidden>
        {config.arrow}
      </span>
      <span className="text-xs uppercase tracking-wide">{config.label}</span>
    </span>
  );
}
