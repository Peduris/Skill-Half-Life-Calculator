import { NextResponse } from "next/server";
import { generateOneLiner, llmEnabled } from "@/lib/llm";
import type { Trend } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 20;

/**
 * Optional enhancement: given a skill that the deterministic engine could only
 * classify by category (no seed one-liner), ask the LLM for a nicer one-liner.
 * Returns { oneLiner: null, enabled: false } when no LLM key is configured so the
 * client can keep its template copy.
 */
export async function POST(req: Request) {
  if (!llmEnabled()) {
    return NextResponse.json({ oneLiner: null, enabled: false });
  }

  const body = await req.json().catch(() => null);
  const skill = typeof body?.skill === "string" ? body.skill.slice(0, 120) : "";
  const category = typeof body?.category === "string" ? body.category.slice(0, 80) : "";
  const trend = (body?.trend as Trend) ?? "stable";
  const halfLife = Number(body?.halfLife) || 5;

  if (!skill) {
    return NextResponse.json({ error: "Missing skill" }, { status: 400 });
  }

  const oneLiner = await generateOneLiner(skill, category, trend, halfLife);
  return NextResponse.json({ oneLiner, enabled: true });
}
