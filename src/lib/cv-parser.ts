import mammoth from "mammoth";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromCv(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return extractTextFromPdf(buffer);
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    return extractTextFromDocx(buffer);
  }
  throw new Error("Unsupported file type. Please upload PDF or DOCX.");
}

const FALLBACK_SKILL_PATTERNS = [
  /\b(?:Python|JavaScript|TypeScript|React|Java|SQL|Excel|AWS|Docker|Kubernetes)\b/gi,
  /\b(?:Leadership|Communication|Management|Marketing|Sales|Design|Engineering)\b/gi,
];

function extractSkillsHeuristic(text: string): string[] {
  const found = new Set<string>();
  for (const pattern of FALLBACK_SKILL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => found.add(m.trim()));
    }
  }
  return [...found].slice(0, 15);
}

export async function extractSkillsFromCvText(text: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) {
    return extractSkillsHeuristic(text);
  }

  try {
    const { text: response } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Extract a list of professional skills from this CV/resume text. Return ONLY a JSON array of skill name strings (max 20). Focus on concrete skills, tools, and competencies — not job titles or companies.

CV text:
${text.slice(0, 8000)}`,
      maxOutputTokens: 500,
    });

    const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, "").trim()) as string[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((s) => String(s).trim()).filter(Boolean).slice(0, 20);
    }
  } catch {
    // fall through
  }

  return extractSkillsHeuristic(text);
}
