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

/**
 * Auto-generated shareable card:
 *   "My skills expire in {X} years. When do yours?" + URL
 * Renders great as a raw image link (Twitter/LinkedIn/Slack unfurls).
 *
 * GET /api/share?years=3.2&expiry=2029
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const years = clampYears(searchParams.get("years"));
  const expiry =
    searchParams.get("expiry") || String(new Date().getFullYear() + Math.round(Number(years)));
  const host = SITE_URL.replace(/^https?:\/\//, "");

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
          padding: "56px",
          position: "relative",
        }}
      >
        {/* Card panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            backgroundColor: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: "24px",
            padding: "52px 56px",
            position: "relative",
          }}
        >
          {/* Premium gradient top bar */}
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

          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: CORAL,
                marginRight: "16px",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: "26px", fontWeight: 700, color: INK }}>
                Skill Half-Life
              </div>
              <div style={{ display: "flex", fontSize: "15px", letterSpacing: "2px", color: INK_SOFT, textTransform: "uppercase" }}>
                by Kickresume
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: "40px" }}>
            <div style={{ display: "flex", fontSize: "44px", color: INK }}>
              My skills expire in
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                marginTop: "6px",
              }}
            >
              <div style={{ display: "flex", fontSize: "180px", fontWeight: 700, color: PREMIUM, lineHeight: 1 }}>
                {years}
              </div>
              <div style={{ display: "flex", fontSize: "72px", fontWeight: 700, color: INK_SOFT, marginLeft: "20px" }}>
                years
              </div>
            </div>
            <div style={{ display: "flex", fontSize: "46px", color: INK, marginTop: "14px" }}>
              When do yours?
            </div>
          </div>

          {/* Expiry pill */}
          <div
            style={{
              position: "absolute",
              top: "78px",
              right: "56px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: CORAL_TINT,
              borderRadius: "18px",
              padding: "16px 26px",
              color: CORAL,
            }}
          >
            <div style={{ display: "flex", fontSize: "22px", letterSpacing: "3px", fontWeight: 700 }}>BEST BEFORE</div>
            <div style={{ display: "flex", fontSize: "64px", fontWeight: 700, lineHeight: 1 }}>{expiry}</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontSize: "30px",
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

function clampYears(raw: string | null): string {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return "5.0";
  const clamped = Math.min(20, Math.max(0.1, n));
  return clamped.toFixed(1);
}
