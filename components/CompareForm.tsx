"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  defaultA?: string;
  defaultB?: string;
  defaultALabel?: string;
  defaultBLabel?: string;
}

/**
 * Client form that builds `/compare?a=...&b=...` from comma-separated skill lists.
 */
export default function CompareForm({
  defaultA = "",
  defaultB = "",
  defaultALabel = "You",
  defaultBLabel = "Role",
}: Props) {
  const router = useRouter();
  const [a, setA] = useState(defaultA);
  const [b, setB] = useState(defaultB);
  const [aLabel, setALabel] = useState(defaultALabel);
  const [bLabel, setBLabel] = useState(defaultBLabel);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("a", a);
    params.set("b", b);
    if (aLabel.trim()) params.set("alabel", aLabel.trim());
    if (bLabel.trim()) params.set("blabel", bLabel.trim());
    router.push(`/compare?${params.toString()}`);
  }

  function fillExample() {
    setALabel("You");
    setBLabel("Role");
    setA("Python, Leadership, Data Analysis, Communication, React");
    setB("jQuery, COBOL, Manual Data Entry, Excel, Cold Calling");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <fieldset className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Left label
          </label>
          <input
            value={aLabel}
            onChange={(e) => setALabel(e.target.value)}
            className="kr-focus rounded-btn border border-line bg-surface px-3 py-2 text-sm"
            placeholder="You"
          />
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft mt-1">
            Skills (comma-separated)
          </label>
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={4}
            className="kr-focus rounded-btn border border-line bg-surface px-3 py-2 text-sm resize-y min-h-[96px]"
            placeholder="Python, Leadership, React…"
            required
          />
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Right label
          </label>
          <input
            value={bLabel}
            onChange={(e) => setBLabel(e.target.value)}
            className="kr-focus rounded-btn border border-line bg-surface px-3 py-2 text-sm"
            placeholder="Role"
          />
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft mt-1">
            Skills (comma-separated)
          </label>
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            rows={4}
            className="kr-focus rounded-btn border border-line bg-surface px-3 py-2 text-sm resize-y min-h-[96px]"
            placeholder="jQuery, COBOL, Excel…"
            required
          />
        </fieldset>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="kr-focus bg-premium-gradient text-white font-semibold rounded-btn px-5 py-3 hover:opacity-95 shadow-card"
        >
          Compare skill sets →
        </button>
        <button
          type="button"
          onClick={fillExample}
          className="kr-focus border border-line bg-surface text-ink font-medium rounded-btn px-5 py-3 hover:bg-surface-soft"
        >
          Load example
        </button>
      </div>
    </form>
  );
}
