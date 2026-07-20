"use client";

import { useEffect, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { track } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics";

interface Props {
  /** Optional explicit URL; defaults to the current page URL at click time. */
  url?: string;
  label?: string;
  className?: string;
  event?: AnalyticsEvent;
}

/**
 * Copies a link (the current page by default) with the same graceful fallback
 * and "Copied!" toast as the results share button. Client-only.
 */
export default function CopyLinkButton({
  url,
  label = "Copy link to this result",
  className = "",
  event = "shared_copy_link",
}: Props) {
  const [href, setHref] = useState(url ?? "");
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") setHref(window.location.href);
  }, [url]);

  async function onCopy() {
    const target = url ?? (typeof window !== "undefined" ? window.location.href : href);
    const ok = await copyToClipboard(target);
    if (ok) {
      setManual(false);
      setCopied(true);
      track(event, { method: "clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      setManual(true);
      track(event, { method: "manual_fallback" });
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button
        onClick={onCopy}
        className={
          className ||
          "kr-focus border border-line bg-surface rounded-btn px-5 py-3 font-semibold text-ink hover:bg-surface-soft hover:border-line-strong transition-colors"
        }
      >
        {copied ? "✓ Copied!" : label}
      </button>
      {manual && (
        <input
          readOnly
          value={href}
          onFocus={(e) => e.currentTarget.select()}
          className="kr-focus w-full rounded-btn border border-line bg-surface-soft px-3 py-2 text-xs text-ink"
        />
      )}

      {/* Matches the results-page share toast so both surfaces feel consistent. */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-btn bg-ink-strong px-4 py-2.5 text-sm font-medium text-white shadow-card transition-all duration-200 ${
          copied ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        ✓ Copied to clipboard
      </div>
    </div>
  );
}
