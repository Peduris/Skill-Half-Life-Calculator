import type { SkillPlan, PlanRow } from "@/lib/plan";
import type { Trend } from "@/lib/types";

interface Props {
  plan: SkillPlan;
}

const TREND_FILL: Record<Trend, string> = {
  growing: "fill-grow",
  stable: "fill-stable",
  declining: "fill-decline",
};

const TREND_HEX: Record<Trend, string> = {
  growing: "#056640",
  stable: "#ffa101",
  declining: "#e80029",
};

// Fixed internal coordinate space; the SVG scales responsively to its container.
const W = 720;
const LABEL_COL = 150;
const CHART_LEFT = LABEL_COL + 18;
const CHART_RIGHT = W - 20;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const TOP = 40;
const ROW_H = 46;
const BOTTOM = 16;
const BAR_H = 12;

function truncate(s: string, n = 20): string {
  return s.length > n ? `${s.slice(0, n - 1)}\u2026` : s;
}

export default function PlanTimeline({ plan }: Props) {
  const { rows, span, startYear } = plan;
  const height = TOP + rows.length * ROW_H + BOTTOM;

  const x = (point: number) =>
    Math.min(CHART_RIGHT, CHART_LEFT + (point / span) * CHART_W);

  const years = Array.from({ length: span + 1 }, (_, i) => startYear + i);

  return (
    <div className="-mx-1 overflow-x-auto px-1 print:mx-0 print:overflow-visible print:px-0">
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height="auto"
      preserveAspectRatio="xMinYMin meet"
      role="img"
      aria-label={`Timeline of your skills from ${startYear} to ${startYear + span}, one track per skill ending at its best-before year.`}
      className="block min-w-[560px] print:min-w-0"
    >
      {/* Vertical year gridlines + axis labels */}
      {years.map((yr, i) => {
        const gx = CHART_LEFT + (i / span) * CHART_W;
        const isNow = i === 0;
        return (
          <g key={yr}>
            <line
              x1={gx}
              y1={TOP - 8}
              x2={gx}
              y2={height - BOTTOM}
              stroke={isNow ? "#d9d9d9" : "#eef0f1"}
              strokeWidth={isNow ? 1.5 : 1}
              strokeDasharray={isNow ? undefined : "3 4"}
            />
            <text
              x={gx}
              y={TOP - 16}
              textAnchor="middle"
              className="fill-ink-soft"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {isNow ? "now" : yr}
            </text>
          </g>
        );
      })}

      {rows.map((row: PlanRow, i) => {
        const rowTop = TOP + i * ROW_H;
        const cy = rowTop + ROW_H / 2;
        const x2 = x(row.expiryPoint);
        const clamped = row.expiryPoint > span;

        return (
          <g key={`${row.input}-${i}`}>
            {/* Skill label (right-aligned in the left column) */}
            <text
              x={LABEL_COL}
              y={cy - 2}
              textAnchor="end"
              className="fill-ink-strong"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              <title>{row.input}</title>
              {truncate(row.input, 20)}
            </text>
            <text
              x={LABEL_COL}
              y={cy + 12}
              textAnchor="end"
              className="fill-ink-soft"
              style={{ fontSize: 10 }}
            >
              {truncate(row.category, 24)}
            </text>

            {/* Track background */}
            <rect
              x={CHART_LEFT}
              y={cy - BAR_H / 2}
              width={CHART_W}
              height={BAR_H}
              rx={BAR_H / 2}
              fill="#f4f7f8"
            />
            {/* Skill track up to its best-before point */}
            <rect
              x={CHART_LEFT}
              y={cy - BAR_H / 2}
              width={Math.max(6, x2 - CHART_LEFT)}
              height={BAR_H}
              rx={BAR_H / 2}
              className={TREND_FILL[row.trend]}
              opacity={0.92}
            />
            {/* "now" dot */}
            <circle cx={CHART_LEFT} cy={cy} r={3.5} fill="#081430" />

            {/* Best-before marker at the end of the track */}
            <circle cx={x2} cy={cy} r={5} fill="#fff" stroke={TREND_HEX[row.trend]} strokeWidth={2.5} />
            {clamped && (
              <text
                x={Math.min(x2 + 8, W - 8)}
                y={cy + 4}
                textAnchor="end"
                className="fill-ink-soft"
                style={{ fontSize: 11 }}
              >
                {"\u203a"}
              </text>
            )}

            {/* Pivot flag for at-risk skills */}
            {row.flagged && row.pivot ? (
              <g>
                <title>{`Pivot to ${row.pivot.skill_name} — ${row.pivot.notes} (${row.pivot.source})`}</title>
                <line x1={x2} y1={cy - BAR_H / 2} x2={x2} y2={cy - 22} stroke={TREND_HEX[row.trend]} strokeWidth={1.5} />
                <path
                  d={`M ${x2} ${cy - 22} h 16 l -4 4 4 4 h -16 z`}
                  fill={TREND_HEX[row.trend]}
                />
              </g>
            ) : (
              (() => {
                // Keep the label fully inside the chart: when the marker sits near
                // the right edge, anchor the text to end just left of the marker
                // instead of letting it spill off-canvas near the final year.
                const nearRight = x2 > CHART_RIGHT - 96;
                return (
                  <text
                    x={nearRight ? x2 - 8 : x2 + 10}
                    y={cy - 10}
                    textAnchor={nearRight ? "end" : "start"}
                    className="fill-ink-soft"
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    best before {row.expiryYear}
                  </text>
                );
              })()
            )}
          </g>
        );
      })}
    </svg>
    </div>
  );
}
