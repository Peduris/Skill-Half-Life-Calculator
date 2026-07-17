import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enrichOneLiners } from "@/lib/one-liners";
import { scoreSkills } from "@/lib/scoring";

const schema = z.object({
  skills: z.array(z.string()).min(1).max(30),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills } = schema.parse(body);

    const result = scoreSkills(skills);
    result.skills = await enrichOneLiners(result.skills);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
