"use client";

/**
 * Lightweight, self-rolled event tracking for the four success metrics:
 *   - started            (user began entering skills / uploaded a CV)
 *   - completed          (got a scored result)
 *   - cv_uploaded        (CV upload path used)
 *   - share_generated    (share card created/downloaded/copied)
 *   - cta_career_map     (Career Map click — primary CTA + plan teaser)
 *   - cta_cv_rebuild     (secondary CTA click)
 *
 * Plus the 2030-plan subpage funnel:
 *   - view_plan          (user clicked through to /plan from results)
 *   - plan_view          (/plan page rendered)
 *   - plan_pdf_download  (downloaded the plan as PDF)
 *   - plan_nav           (Back / Home / Do It Again — see `action` prop)
 *   - cta_resume_checker / cta_resume_tailoring / cta_job_board (teaser clicks)
 *
 * Events POST to /api/track (server logs + optional forwarding). We also mirror
 * to Plausible if it's loaded, so switching to a hosted analytics tool later is
 * a drop-in. Fire-and-forget; never blocks the UI.
 */

export type AnalyticsEvent =
  | "started"
  | "completed"
  | "cv_uploaded"
  | "share_generated"
  | "cta_career_map"
  | "cta_cv_rebuild"
  | "view_plan"
  | "plan_view"
  | "plan_pdf_download"
  | "plan_nav"
  | "cta_resume_checker"
  | "cta_resume_tailoring"
  | "cta_job_board"
  | "shared_view"
  | "shared_copy_link"
  | "cta_calculate_own";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

// De-dupe one-shot funnel events within a session.
const fired = new Set<string>();

export function track(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {},
  once = false,
): void {
  if (typeof window === "undefined") return;
  if (once) {
    if (fired.has(event)) return;
    fired.add(event);
  }

  try {
    window.plausible?.(event, { props });
  } catch {
    /* noop */
  }

  const body = JSON.stringify({ event, props, ts: Date.now(), path: window.location.pathname });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* analytics must never break the app */
  }
}
