import { NextRequest, NextResponse } from "next/server";
import { getAutocompleteSuggestions } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const suggestions = getAutocompleteSuggestions(q);
  return NextResponse.json({ suggestions });
}
