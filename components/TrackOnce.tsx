"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics";

/** Fires a single analytics event on mount — usable inside server components. */
export default function TrackOnce({
  event,
  props = {},
}: {
  event: AnalyticsEvent;
  props?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, props, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
