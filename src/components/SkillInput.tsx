"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface SkillInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function SkillInput({ skills, onChange, onSubmit, loading }: SkillInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(input), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addSkill(input);
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <label htmlFor="skill-input" className="mb-2 block text-sm font-medium text-stone-700">
        Enter your skills (comma or Enter to add)
      </label>
      <div ref={wrapperRef} className="relative">
        <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border-2 border-amber-800/30 bg-white px-3 py-2 focus-within:border-amber-700">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 text-amber-700 hover:text-red-600"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="skill-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={skills.length === 0 ? "Python, Leadership, Excel…" : "Add another…"}
            className="min-w-[120px] flex-1 border-0 bg-transparent py-2 text-stone-800 outline-none placeholder:text-stone-400"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50"
                  onClick={() => addSkill(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          trackEvent("calculation_started", { method: "text", skill_count: skills.length });
          onSubmit();
        }}
        disabled={skills.length === 0 || loading}
        className="mt-4 w-full rounded-full bg-red-700 px-8 py-4 text-lg font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Calculating expiry…" : "Calculate my skill half-life"}
      </button>
    </div>
  );
}
