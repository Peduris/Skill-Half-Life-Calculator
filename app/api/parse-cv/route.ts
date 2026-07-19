import { NextResponse } from "next/server";
import { extractSkillsFromCV, llmEnabled } from "@/lib/llm";
import { extractSkillsFallback } from "@/lib/cv-fallback";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * CV upload -> extract text (PDF/DOCX/plain) -> extract a skill list.
 * Uses the LLM when configured, and always falls back to a deterministic
 * keyword scan so the path works with no API key.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const name = file.name.toLowerCase();

    let text = "";
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      text = await extractPdf(buf);
    } else if (
      name.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractDocx(buf);
    } else if (name.endsWith(".txt") || file.type.startsWith("text/")) {
      text = buf.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, DOCX, or TXT." },
        { status: 415 },
      );
    }

    text = text.replace(/\s+/g, " ").trim();
    if (text.length < 20) {
      return NextResponse.json(
        { error: "Couldn't read enough text from that file. Try another export." },
        { status: 422 },
      );
    }

    let skills: string[] | null = null;
    let source: "llm" | "fallback" = "fallback";
    if (llmEnabled()) {
      skills = await extractSkillsFromCV(text);
      if (skills && skills.length > 0) source = "llm";
    }
    if (!skills || skills.length === 0) {
      skills = extractSkillsFallback(text);
      source = "fallback";
    }

    if (!skills || skills.length === 0) {
      return NextResponse.json(
        { error: "No recognizable skills found. Try typing them in instead." },
        { status: 422 },
      );
    }

    return NextResponse.json({ skills, source });
  } catch (err) {
    console.error("[parse-cv] error", err);
    return NextResponse.json({ error: "Failed to parse the file." }, { status: 500 });
  }
}

async function extractPdf(buf: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buf));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join(" ") : text;
}

async function extractDocx(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer: buf });
  return value;
}
