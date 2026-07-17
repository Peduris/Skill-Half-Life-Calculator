import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { getSeedSkills } from "./data";
import type { ScoredSkill } from "./types";

const FEW_SHOT_EXAMPLES = () =>
  getSeedSkills()
    .slice(0, 6)
    .map((s) => `- ${s.skill} (${s.trend}): "${s.one_liner}"`)
    .join("\n");

export async function enrichOneLiners(skills: ScoredSkill[]): Promise<ScoredSkill[]> {
  const needsLlm = skills.filter((s) => s.matchSource === "category" && s.skill_type === "inferred");

  if (needsLlm.length === 0 || !process.env.OPENAI_API_KEY) {
    return skills;
  }

  try {
    const prompt = `Write playful-morbid one-liners for these skills. Tone: expiry stamps, "best before" labels — never doom-bait or mocking the person. One sentence each, max 20 words.

Examples:
${FEW_SHOT_EXAMPLES()}

Skills to write for:
${needsLlm.map((s) => `- ${s.input} (category: ${s.category}, trend: ${s.trend}, half-life: ${s.half_life_years} years)`).join("\n")}

Return ONLY a JSON array of strings in the same order.`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxOutputTokens: 500,
    });

    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim()) as string[];
    let idx = 0;
    return skills.map((s) => {
      if (s.matchSource === "category" && s.skill_type === "inferred" && parsed[idx]) {
        const updated = { ...s, one_liner: parsed[idx] };
        idx++;
        return updated;
      }
      return s;
    });
  } catch {
    return skills;
  }
}
