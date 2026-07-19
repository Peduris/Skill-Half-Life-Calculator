"use client";

import type { Verdict } from "./types";

/**
 * The calculator is a client-side SPA with in-memory state. To hand a scored
 * result off to the /plan subpage (which lives on its own route), we stash the
 * verdict in sessionStorage. sessionStorage survives same-tab navigation and
 * refresh, so /plan always has data to render as long as the user got there
 * through the app.
 */
const KEY = "shl:verdict:v1";

export function saveVerdict(verdict: Verdict): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(verdict));
  } catch {
    /* private mode / quota — /plan will fall back to an empty state */
  }
}

export function loadVerdict(): Verdict | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Verdict;
    if (!parsed || !Array.isArray(parsed.skills) || parsed.skills.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearVerdict(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
