"use client";

/**
 * Copy text to the clipboard with graceful degradation:
 *   1) navigator.clipboard (needs a secure context + permission)
 *   2) hidden <textarea> + document.execCommand("copy") (legacy, but works in
 *      more contexts — including some in-app webviews where the async API is
 *      blocked)
 * Returns true on success; callers should show a manual "select this text"
 * fallback when it returns false.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to legacy path */
    }
  }

  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
