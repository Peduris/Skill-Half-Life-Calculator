import { NextResponse } from "next/server";
import { lightcastEnabled, lightcastSuggest } from "@/lib/lightcast";

export const runtime = "nodejs";

/**
 * Autocomplete suggestions. Uses the Lightcast Skills API when credentials are
 * configured, otherwise returns [] and the client falls back to local seed-based
 * fuzzy matching (which always works, even before API approval).
 */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!lightcastEnabled()) {
    return NextResponse.json({ suggestions: [], source: "local" });
  }
  const suggestions = await lightcastSuggest(q);
  return NextResponse.json({ suggestions, source: "lightcast" });
}
