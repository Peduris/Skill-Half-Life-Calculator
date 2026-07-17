"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface CvUploadProps {
  onSkillsExtracted: (skills: string[]) => void;
  loading?: boolean;
}

export function CvUpload({ onSkillsExtracted, loading }: CvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    setParsing(true);
    trackEvent("cv_upload_started");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-cv", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      trackEvent("cv_upload_completed", { skill_count: data.skills.length });
      onSkillsExtracted(data.skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <p className="mb-2 text-sm font-medium text-stone-700">Or upload your CV</p>
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-800/30 bg-white/60 px-6 py-10 transition hover:border-amber-700 hover:bg-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <p className="mb-2 text-stone-600">Drop PDF or DOCX here</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={parsing || loading}
          className="rounded-full border-2 border-stone-800 px-6 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:opacity-50"
        >
          {parsing ? "Extracting skills…" : "Choose file"}
        </button>
        {fileName && (
          <p className="mt-2 text-xs text-stone-500">{fileName}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
