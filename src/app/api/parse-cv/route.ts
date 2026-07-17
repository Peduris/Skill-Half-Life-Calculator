import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromCvText, extractTextFromCv } from "@/lib/cv-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromCv(buffer, file.name);
    const skills = await extractSkillsFromCvText(text);

    if (skills.length === 0) {
      return NextResponse.json(
        { error: "Could not extract skills from CV. Try adding skills manually." },
        { status: 422 }
      );
    }

    return NextResponse.json({ skills, extractedChars: text.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CV parsing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
