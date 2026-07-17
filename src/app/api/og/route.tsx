import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const years = searchParams.get("years") ?? "3.2";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "whenwillmyskillsexpire.com";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f0e8",
          backgroundImage:
            "linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 50%, #f5f0e8 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "6px dashed #8b4513",
            borderRadius: 16,
            padding: 48,
            backgroundColor: "#fffef9",
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#8b4513",
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Best Before
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#c41e3a",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {years} yrs
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#2d2a26",
              textAlign: "center",
              marginBottom: 32,
              maxWidth: 700,
            }}
          >
            My skills expire in {years} years.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#5c5348",
              fontStyle: "italic",
            }}
          >
            When do yours?
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 22,
              color: "#8b4513",
              fontWeight: 600,
            }}
          >
            {siteUrl}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
