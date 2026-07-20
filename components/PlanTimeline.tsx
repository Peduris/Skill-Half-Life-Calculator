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

/** Post-half-life substitution segment — indigo/grey so it reads as "what comes next". */
const SUB_FILL = "#c5c9e8";
const SUB_STROKE = "#666cff";
const SUB_TEXT = "#514eea";

// Fixed internal coordinate space; the SVG scales responsively to its container.
const W = 720;
const LABEL_COL = 150;
const CHART_LEFT = LABEL_COL + 18;
const CHART_RIGHT = W - 20;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const TOP = 40;
const ROW_H = 56;
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
        aria-label={`Timeline of your skills from ${startYear} to ${startYear + span}. Each track ends at its best-before year, then shows the skill that eventually replaces it.`}
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
          const cy = rowTop + ROW_H / 2 - 4;
          const x2 = x(row.expiryPoint);
          const clamped = row.expiryPoint > span;
          const subName = row.substitute.skill_name;
          const subW = Math.max(0, CHART_RIGHT - x2);
          const showSubBar = subW >= 14;

          return (
            <g key={`${row.input}-${i}`}>
              {/* Skill label */}
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

              {/* Live skill track up to best-before */}
              <rect
                x={CHART_LEFT}
                y={cy - BAR_H / 2}
                width={Math.max(6, x2 - CHART_LEFT)}
                height={BAR_H}
                rx={BAR_H / 2}
                className={TREND_FILL[row.trend]}
                opacity={0.92}
              />

              {/* After half-life: substitution segment (grey-blue) */}
              {showSubBar && (
                <g>
                  <title>{`After ${row.expiryYear}, replaced by ${subName}`}</title>
                  <rect
                    x={x2}
                    y={cy - BAR_H / 2}
                    width={subW}
                    height={BAR_H}
                    rx={BAR_H / 2}
                    fill={SUB_FILL}
                    stroke={SUB_STROKE}
                    strokeWidth={0.75}
                    opacity={0.95}
                  />
                  {/* Cover the rounded join so the two bars read as one track */}
                  <rect
                    x={x2 - 1}
                    y={cy - BAR_H / 2}
                    width={4}
                    height={BAR_H}
                    fill={SUB_FILL}
                  />
                </g>
              )}

              {/* "now" dot */}
              <circle cx={CHART_LEFT} cy={cy} r={3.5} fill="#081430" />

              {/* Best-before marker */}
              <circle
                cx={x2}
                cy={cy}
                r={5}
                fill="#fff"
                stroke={TREND_HEX[row.trend]}
                strokeWidth={2.5}
              />
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

              {/* Best-before year above the marker */}
              <text
                x={x2}
                y={cy - 12}
                textAnchor="middle"
                className="fill-ink-soft"
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                {row.expiryYear}
              </text>

              {/* Substitution label under the post-half-life segment */}
              <text
                x={showSubBar ? x2 + Math.min(subW / 2, 80) : Math.min(x2 + 8, CHART_RIGHT - 4)}
                y={cy + 22}
                textAnchor={showSubBar ? "middle" : "start"}
                fill={SUB_TEXT}
                style={{ fontSize: 9, fontWeight: 600 }}
              >
                <title>{`Eventually replaced by ${subName} (${row.substitute.source})`}</title>
                → {truncate(subName, showSubBar && subW > 100 ? 28 : 18)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
