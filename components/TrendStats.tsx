import type { Trend } from "@/lib/types";
import { TREND_COPY, TREND_ORDER } from "@/lib/trends";

interface Props {
  growing: number;
  stable: number;
  declining: number;
  /** Compact layout for denser result headers (e.g. /r). */
  compact?: boolean;
}

const TINT: Record<Trend, string> = {
  growing: "bg-grow-tint text-grow",
  stable: "bg-stable-tint text-stable",
  declining: "bg-decline-tint text-decline",
};

/**
 * Growing / Stable / Declining counters with a one-line definition under each,
 * so the labels aren't mysterious "graphs."
 */
export default function TrendStats({ growing, stable, declining, compact }: Props) {
  const values: Record<Trend, number> = { growing, stable, declining };

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
      {TREND_ORDER.map((trend) => {
        const copy = TREND_COPY[trend];
        return (
          <div
            key={trend}
            title={copy.meaning}
            className={`flex flex-col items-center rounded-card ${TINT[trend].split(" ")[0]} ${
              compact ? "py-2.5 px-1.5" : "py-3 px-2"
            }`}
          >
            <span className={`text-2xl font-bold ${TINT[trend].split(" ")[1]}`}>
              {values[trend]}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {copy.label}
            </span>
            <span
              className={`mt-0.5 text-center leading-snug text-ink-soft ${
                compact ? "text-[9px]" : "text-[10px]"
              }`}
            >
              {copy.short}
            </span>
          </div>
        );
      })}
    </div>
  );
}
