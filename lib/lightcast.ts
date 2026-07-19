/**
 * Optional Lightcast Skills API client (progressive enhancement).
 *
 * The free tier requires a registration form + email verification before you get
 * a Client ID/Secret (see data/sources.csv -> "Lightcast Free API Access"). The
 * whole app ships and works against the local seed CSVs without this. When creds
 * are present, we use Lightcast for richer autocomplete suggestions.
 */

let tokenCache: { token: string; expiresAt: number } | null = null;

export function lightcastEnabled(): boolean {
  return Boolean(process.env.LIGHTCAST_CLIENT_ID && process.env.LIGHTCAST_CLIENT_SECRET);
}

async function getToken(): Promise<string | null> {
  if (!lightcastEnabled()) return null;
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;

  try {
    const res = await fetch("https://auth.emsicloud.com/connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.LIGHTCAST_CLIENT_ID!,
        client_secret: process.env.LIGHTCAST_CLIENT_SECRET!,
        scope: "emsi_open",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    };
    return tokenCache.token;
  } catch {
    return null;
  }
}

/** Autocomplete skill names from Lightcast. Returns [] when unavailable. */
export async function lightcastSuggest(query: string, limit = 6): Promise<string[]> {
  const token = await getToken();
  if (!token || query.trim().length < 2) return [];
  try {
    const url = new URL("https://emsiservices.com/skills/versions/latest/skills");
    url.searchParams.set("q", query.trim());
    url.searchParams.set("limit", String(limit));
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: { name?: string }[] = data?.data ?? [];
    return rows.map((r) => r.name).filter((n): n is string => Boolean(n)).slice(0, limit);
  } catch {
    return [];
  }
}
