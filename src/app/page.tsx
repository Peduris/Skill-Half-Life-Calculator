import type { Metadata } from "next";
import { getSources } from "@/lib/data";
import { Calculator } from "@/components/Calculator";

export const metadata: Metadata = {
  title: "Skill Half-Life Calculator | When Will My Skills Expire?",
  description:
    "Enter your skills and get a playful expiry date for each one — plus your personal skill half-life. Evidence-based, not a horoscope.",
  openGraph: {
    title: "Skill Half-Life Calculator",
    description: "When do your skills expire? Find out in 30 seconds.",
    siteName: "Skill Half-Life Calculator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Half-Life Calculator",
    description: "My skills expire in X years. When do yours?",
  },
};

export default function Home() {
  const sources = getSources();

  return <Calculator sources={sources} />;
}
