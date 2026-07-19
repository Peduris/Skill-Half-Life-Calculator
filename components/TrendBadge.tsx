import type { Trend } from "@/lib/types";

const MAP: Record<Trend, { label: string; arrow: string; className: string }> = {
  growing: { label: "Growing", arrow: "↗", className: "text-grow bg-grow-tint" },
  stable: { label: "Stable", arrow: "→", className: "text-stable bg-stable-tint" },
  declining: { label: "Declining", arrow: "↘", className: "text-decline bg-decline-tint" },
};

export default function TrendBadge({ trend }: { trend: Trend }) {
  const t = MAP[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded-pill px-2.5 py-0.5 ${t.className}`}
    >
      <span aria-hidden className="text-sm leading-none">{t.arrow}</span>
      {t.label}
    </span>
  );
}
