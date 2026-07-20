import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { computeVerdict } from "@/lib/scoring";
import { buildPlan } from "@/lib/plan";
import PlanDocument from "@/components/pdf/PlanDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SKILLS = 30;

/** Canonical public URL of the live app (for the footer QR + wordmark). */
function appBaseUrl(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "";
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    fromVercel ||
    "https://skill-half-life-calculator.vercel.app"
  ).replace(/\/$/, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("skills") || "";
  const skills = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, MAX_SKILLS);

  if (skills.length === 0) {
    return new Response("No skills provided", { status: 400 });
  }

  const verdict = computeVerdict(skills);
  const plan = buildPlan(verdict);

  const base = appBaseUrl();
  const siteHost = base.replace(/^https?:\/\//, "");
  // QR sends scanners to the calculator so they can run their own report.
  // High module count + quiet zone for comfortable print-size scanning (~52pt).
  const qrDataUrl = await QRCode.toDataURL(base, {
    margin: 2,
    width: 280,
    errorCorrectionLevel: "M",
    color: { dark: "#081430", light: "#ffffff" },
  });

  const buffer = await renderToBuffer(
    <PlanDocument verdict={verdict} plan={plan} qrDataUrl={qrDataUrl} siteHost={siteHost} />,
  );

  const filename = `2030-skill-plan-${verdict.headlineHalfLife.toFixed(1)}yr.pdf`;
  const inline = searchParams.get("inline") === "1";
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
