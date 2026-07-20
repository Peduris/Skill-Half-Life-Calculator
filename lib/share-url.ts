/**
 * Build a personalized share-card URL for /api/share.
 * Passes years, expiry, top skills, and trend counts so OG previews
 * reflect the actual result instead of a generic card.
 */
export function buildShareImageUrl(opts: {
  origin?: string;
  years: string | number;
  expiry: string | number;
  skills?: string[];
  growing?: number;
  stable?: number;
  declining?: number;
}): string {
  const params = new URLSearchParams();
  params.set("years", String(opts.years));
  params.set("expiry", String(opts.expiry));
  if (opts.skills && opts.skills.length > 0) {
    params.set("skills", opts.skills.slice(0, 5).join(","));
  }
  if (opts.growing !== undefined) params.set("g", String(opts.growing));
  if (opts.stable !== undefined) params.set("s", String(opts.stable));
  if (opts.declining !== undefined) params.set("d", String(opts.declining));
  const path = `/api/share?${params.toString()}`;
  return opts.origin ? `${opts.origin}${path}` : path;
}
