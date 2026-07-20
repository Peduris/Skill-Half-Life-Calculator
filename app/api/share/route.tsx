import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/config";

export const runtime = "edge";

const BG = "#f4f7f8";
const CARD = "#ffffff";
const INK = "#081430";
const INK_SOFT = "#8c8c8c";
const CORAL = "#ff5e59";
const CORAL_TINT = "#fff4f3";
const PREMIUM = "#666cff";
const BORDER = "#e9e9e9";
const GROW = "#056640";
const GROW_TINT = "#ecfef4";
const STABLE = "#b26a00";
const STABLE_TINT = "#fff2dc";
const DECLINE = "#e80029";
const DECLINE_TINT = "#f9e8e4";

/**
 * Personalized shareable card.
 * GET /api/share?years=3.2&expiry=2029&skills=Python,jQuery&g=2&s=1&d=1
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const years = clampYears(searchParams.get("years"));
  const expiry =
    searchParams.get("expiry") || String(new Date().getFullYear() + Math.round(Number(years)));
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const skills = (searchParams.get("skills") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  const g = parseCount(searchParams.get("g"));
  const s = parseCount(searchParams.get("s"));
  const d = parseCount(searchParams.get("d"));
  const hasCounts = g !== null || s !== null || d !== null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BG,
          fontFamily: "sans-serif",
          padding: "48px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "24px",
            padding: "44px 52px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              background: "linear-gradient(315deg, #a066ff 0%, #666cff 100%)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  width: "40px",
                  height: "40px",
                  borderRadius: "11px",
                  backgroundColor: CORAL,
                  marginRight: "14px",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: "24px", fontWeight: 700, color: INK }}>
                  Skill Half-Life
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "13px",
                    letterSpacing: "2px",
                    color: INK_SOFT,
                    textTransform: "uppercase",
                  }}
                >
                  by Kickresume
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: CORAL_TINT,
                borderRadius: "16px",
                padding: "12px 22px",
                color: CORAL,
              }}
            >
              <div style={{ display: "flex", fontSize: "16px", letterSpacing: "2px", fontWeight: 700 }}>
                BEST BEFORE
              </div>
              <div style={{ display: "flex", fontSize: "42px", fontWeight: 700, lineHeight: 1 }}>
                {expiry}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "28px" }}>
            <div style={{ display: "flex", fontSize: "32px", color: INK }}>My skills expire in</div>
            <div style={{ display: "flex", alignItems: "baseline", marginTop: "4px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: skills.length > 0 || hasCounts ? 140 : 180,
                  fontWeight: 700,
                  color: PREMIUM,
                  lineHeight: 1,
                }}
              >
                {years}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 56,
                  fontWeight: 700,
                  color: INK_SOFT,
                  marginLeft: "16px",
                }}
              >
                years
              </div>
            </div>
            <div style={{ display: "flex", fontSize: "36px", color: INK, marginTop: "8px" }}>
              When do yours?
            </div>
          </div>

          {/* Personalized chips: skills + trend counts */}
          {(skills.length > 0 || hasCounts) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "28px",
                alignItems: "center",
              }}
            >
              {skills.map((name) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    backgroundColor: "#f4f7f8",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: INK,
                  }}
                >
                  {truncate(name, 22)}
                </div>
              ))}
              {hasCounts && (
                <div style={{ display: "flex", gap: "8px", marginLeft: skills.length ? 6 : 0 }}>
                  {g !== null && g > 0 && (
                    <CountPill n={g} label="growing" bg={GROW_TINT} color={GROW} />
                  )}
                  {s !== null && s > 0 && (
                    <CountPill n={s} label="stable" bg={STABLE_TINT} color={STABLE} />
                  )}
                  {d !== null && d > 0 && (
                    <CountPill n={d} label="declining" bg={DECLINE_TINT} color={DECLINE} />
                  )}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontSize: "26px",
              color: INK_SOFT,
              letterSpacing: "2px",
            }}
          >
            {host}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function CountPill({
  n,
  label,
  bg,
  color,
}: {
  n: number;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: bg,
        borderRadius: "999px",
        padding: "8px 14px",
        fontSize: "18px",
        fontWeight: 700,
        color,
      }}
    >
      {n} {label}
    </div>
  );
}

function clampYears(raw: string | null): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return "5.0";
  const clamped = Math.min(20, Math.max(0.1, n));
  return clamped.toFixed(1);
}

function parseCount(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(99, Math.round(n));
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
