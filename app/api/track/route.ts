import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Minimal self-rolled event sink. For MVP this just structured-logs events so
 * they show up in Vercel's function logs / any log drain. Swap the console.log
 * for a DB insert or a forward to PostHog/Plausible when you outgrow this.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = typeof body?.event === "string" ? body.event : "unknown";
    const record = {
      type: "analytics",
      event,
      props: body?.props ?? {},
      path: body?.path ?? null,
      ts: body?.ts ?? Date.now(),
      ua: req.headers.get("user-agent") ?? null,
    };
    // Structured, greppable single-line log.
    console.log(`[analytics] ${JSON.stringify(record)}`);
  } catch {
    /* never fail the beacon */
  }
  return NextResponse.json({ ok: true });
}
