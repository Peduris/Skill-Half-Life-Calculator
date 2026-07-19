import type { Metadata } from "next";
import "./globals.css";
import { PLAUSIBLE_DOMAIN, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/config";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} by Kickresume — ${SITE_TAGLINE}`,
  description:
    "Enter your skills or upload your CV and find out your personal skill half-life — grounded in the WEF Future of Jobs 2025 report, IBM's half-life research, and the Lightcast skills taxonomy.",
  keywords: [
    "skill half-life",
    "skills expiry",
    "future of jobs",
    "WEF 2025",
    "reskilling",
    "career",
  ],
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Find out your personal skill half-life. When will your skills expire?",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/api/share?years=5.0", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: "Find out your personal skill half-life. When will your skills expire?",
    images: ["/api/share?years=5.0"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {PLAUSIBLE_DOMAIN ? (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
