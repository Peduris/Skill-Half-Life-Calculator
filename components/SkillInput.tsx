"use client";

import { useEffect, useRef, useState } from "react";
import { localSuggest, STARTER_SKILLS } from "@/lib/local-suggest";
import { track } from "@/lib/analytics";
import { RESUME_CHECKER_URL, withUtm } from "@/lib/config";

interface Props {
  onCompute: (skills: string[]) => void;
  initialSkills?: string[];
  autoCompute?: boolean;
}

const NUDGE_KEY = "shl:nudge-dismissed:v1";

export default function SkillInput({ onCompute, initialSkills, autoCompute }: Props) {
  const [skills, setSkills] = useState<string[]>(initialSkills ?? []);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeReason, setNudgeReason] = useState<"cv" | "skills" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const didAuto = useRef(false);

  function nudgeDismissed(): boolean {
    try {
      return sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function dismissNudge() {
    setShowNudge(false);
    try {
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      /* noop */
    }
  }

  function revealNudge(reason: "cv" | "skills") {
    if (nudgeDismissed()) return;
    setNudgeReason(reason);
    setShowNudge(true);
    track("cta_nudge", { reason, action: "shown" }, true);
  }

  useEffect(() => {
    if (initialSkills && initialSkills.length > 0) {
      setSkills((prev) => {
        const set = new Set(prev.map((x) => x.toLowerCase()));
        const merged = [...prev];
        for (const s of initialSkills) {
          if (!set.has(s.toLowerCase())) merged.push(s);
        }
        return merged;
      });
    }
  }, [initialSkills]);

  useEffect(() => {
    if (!autoCompute || didAuto.current || skills.length === 0) return;
    didAuto.current = true;
    onCompute(skills);
  }, [autoCompute, skills, onCompute]);

  useEffect(() => {
    if (skills.length >= 3 && nudgeReason !== "cv") {
      revealNudge("skills");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills.length]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    const local = localSuggest(q);
    setSuggestions(local);

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.suggestions) || data.suggestions.length === 0) return;
        const merged = Array.from(new Set([...data.suggestions, ...local])).slice(0, 7);
        setSuggestions(merged);
      } catch {
        /* keep local */
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  function addSkill(s: string) {
    const val = s.trim();
    if (!val) return;
    setSkills((prev) => {
      if (prev.some((x) => x.toLowerCase() === val.toLowerCase())) return prev;
      track("started", { via: "text" }, true);
      return [...prev, val];
    });
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  }

  function removeSkill(s: string) {
    setSkills((prev) => prev.filter((x) => x !== s));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const live = e.currentTarget.value;
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(live || query);
    } else if (e.key === ",") {
      e.preventDefault();
      addSkill(live || query);
    } else if (e.key === "Backspace" && !live && skills.length) {
      removeSkill(skills[skills.length - 1]);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    track("started", { via: "cv" }, true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadMsg(data?.error || "Couldn't read that file.");
        return;
      }
      const extracted: string[] = data.skills || [];
      track("cv_uploaded", { count: extracted.length, source: data.source }, true);
      setSkills((prev) => {
        const set = new Set(prev.map((x) => x.toLowerCase()));
        const merged = [...prev];
        for (const s of extracted) {
          if (!set.has(s.toLowerCase())) merged.push(s);
        }
        return merged;
      });
      setUploadMsg(
        `Found ${extracted.length} skill${extracted.length === 1 ? "" : "s"} in your CV. Edit below, then calculate.`,
      );
      revealNudge("cv");
    } catch {
      setUploadMsg("Upload failed. Try again or type your skills.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function compute() {
    if (skills.length === 0) return;
    onCompute(skills);
  }

  const nudgeHref = withUtm(RESUME_CHECKER_URL, nudgeReason === "cv" ? "nudge-cv" : "nudge-skills");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface border border-line rounded-[24px] p-5 sm:p-7 shadow-search">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 bg-primary-tint border border-primary-tint-2 rounded-pill pl-3 pr-1.5 py-1 text-sm font-medium text-primary-active"
              >
                {s}
                <button
                  onClick={() => removeSkill(s)}
                  aria-label={`Remove ${s}`}
                  className="w-5 h-5 rounded-full hover:bg-primary/15 text-primary-active/70 hover:text-primary-active flex items-center justify-center leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={
              skills.length ? "Add another skill…" : "Type a skill, e.g. Python, Leadership, Welding…"
            }
            className="kr-focus w-full bg-surface border border-line focus:border-ring rounded-btn px-4 py-3 text-base outline-none transition-colors placeholder:text-ink-soft"
            aria-label="Add a skill"
          />
          {open && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-2 w-full bg-surface border border-line rounded-btn overflow-hidden shadow-card">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addSkill(s);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-primary-tint hover:text-primary-active text-sm transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {showNudge && (
          <div className="mt-4 relative rounded-[14px] border border-indigo/25 bg-indigo/5 px-4 py-3 pr-10">
            <button
              type="button"
              onClick={dismissNudge}
              aria-label="Dismiss"
              className="kr-focus absolute top-2 right-2 w-7 h-7 rounded-full text-ink-soft hover:bg-surface text-lg leading-none"
            >
              ×
            </button>
            <p className="text-sm font-semibold text-ink-strong">
              {nudgeReason === "cv"
                ? "While we score your skills — free resume check"
                : "Building a skill list? See if your resume keeps up"}
            </p>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              Kickresume scores your CV against ones that got people hired. Takes about a minute —
              then come back and hit calculate.
            </p>
            <a
              href={nudgeHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_nudge", { reason: nudgeReason, action: "click" })}
              className="kr-focus mt-2.5 inline-flex text-sm font-semibold text-indigo hover:text-primary-active"
            >
              Check my resume score →
            </a>
          </div>
        )}

        {skills.length === 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.14em] font-semibold text-ink-soft mb-2">
              Try one
            </p>
            <div className="flex flex-wrap gap-2">
              {STARTER_SKILLS.map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="kr-focus text-xs sm:text-sm font-medium border border-line rounded-pill px-3 py-1.5 text-ink-soft hover:border-primary hover:text-primary transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-line my-6" />

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="kr-focus text-sm font-medium inline-flex items-center gap-2 border border-line rounded-btn px-4 py-2.5 text-ink hover:bg-surface-soft hover:border-line-strong disabled:opacity-60 transition-colors"
            >
              {uploading ? "Reading your CV…" : "📄 Upload CV (PDF / DOCX)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={onFile}
            />
          </div>

          <button
            onClick={compute}
            disabled={skills.length === 0}
            className="kr-focus bg-primary text-white font-semibold rounded-btn px-6 py-3 hover:bg-primary-hover active:bg-primary-active transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
          >
            Check the expiry date →
          </button>
        </div>

        {uploadMsg && <p className="mt-3 text-sm text-ink-soft">{uploadMsg}</p>}
      </div>
      <p className="text-center text-xs text-ink-soft mt-3">
        Runs entirely in your browser. Nothing is stored. CV files are parsed then discarded.
      </p>
    </div>
  );
}
