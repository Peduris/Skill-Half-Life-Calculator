import type { AnalyticsEvent } from "./types";

type EventPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(event: AnalyticsEvent, payload?: EventPayload): void {
  if (typeof window === "undefined") return;

  const data = { event, ...payload, timestamp: Date.now() };

  // Plausible custom events
  if (typeof window.plausible === "function") {
    window.plausible(event, { props: payload });
  }

  // PostHog (if configured)
  if (typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, payload);
  }

  // Self-rolled fallback for dev / when no provider is configured
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", data);
  }

  // Lightweight beacon to our own endpoint
  try {
    const body = JSON.stringify(data);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", body);
    } else {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // non-blocking
  }
}

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventPayload }) => void;
    posthog?: { capture: (event: string, props?: EventPayload) => void };
  }
}
