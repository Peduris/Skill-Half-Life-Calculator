import path from "path";
import { readFileSync } from "fs";

/** Resolve a file under /public/brand for PDF embedding (works locally + on Vercel). */
export function brandPath(...parts: string[]): string {
  return path.join(process.cwd(), "public", "brand", ...parts);
}

/** Load a brand PNG as a data URL so @react-pdf never depends on remote fetches. */
export function brandPngDataUrl(filename: string): string {
  const buf = readFileSync(brandPath(filename));
  return `data:image/png;base64,${buf.toString("base64")}`;
}
