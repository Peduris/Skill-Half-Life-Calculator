"use client";

import { trackEvent } from "@/lib/analytics";

interface ShareButtonProps {
  halfLife: number;
}

export function ShareButton({ halfLife }: ShareButtonProps) {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://whenwillmyskillsexpire.com";

  const ogUrl = `${siteUrl}/api/og?years=${halfLife.toFixed(1)}`;

  const handleShare = async () => {
    trackEvent("share_card_generated", { half_life: halfLife });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `My skills expire in ${halfLife.toFixed(1)} years`,
          text: "When do yours? Check your skill half-life:",
          url: siteUrl,
        });
        return;
      } catch {
        // user cancelled or unsupported
      }
    }

    window.open(ogUrl, "_blank");
  };

  const handleDownload = () => {
    trackEvent("share_card_generated", { half_life: halfLife, action: "download" });
    const link = document.createElement("a");
    link.href = ogUrl;
    link.download = `skill-half-life-${halfLife.toFixed(1)}.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full bg-stone-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
      >
        Share your expiry date
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="rounded-full border-2 border-stone-800 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
      >
        Download share card
      </button>
      {/* Preview — dynamic OG route; next/image not applicable */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ogUrl}
        alt={`Share card: My skills expire in ${halfLife.toFixed(1)} years`}
        className="mt-4 w-full max-w-sm rounded-lg border border-stone-200 shadow-md"
      />
    </div>
  );
}
