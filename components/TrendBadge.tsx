import type { Trend } from "@/lib/types";
import { TREND_COPY } from "@/lib/trends";

export default function TrendBadge({ trend }: { trend: Trend }) {
  const t = TREND_COPY[trend];
  const arrow = trend === "growing" ? "↗" : trend === "stable" ? "→" : "↘";
  const className =
    trend === "growing"
      ? "text-grow bg-grow-tint"
      : trend === "stable"
        ? "text-stable bg-stable-tint"
        : "text-decline bg-decline-tint";

  return (
    <span
      title={t.meaning}
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-pill px-2.5 py-0.5 ${className}`}
    >
      <span aria-hidden className="text-sm leading-none">
        {arrow}
      </span>
      {t.label}
    </span>
  );
}
