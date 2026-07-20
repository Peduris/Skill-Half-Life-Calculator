"use client";

import { SIGNUP_URL, CREATE_RESUME_URL } from "@/lib/config";
import { track } from "@/lib/analytics";
import Logo from "./Logo";

interface Props {
  /** Compact sticky header used on subpages. */
  compact?: boolean;
}

/** Shared acquisition chrome: Kickresume signup always visible. */
export function SiteHeader({ compact }: Props) {
  return (
    <header className="w-full border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
      <div
        className={`max-w-5xl mx-auto px-4 flex items-center justify-between gap-3 ${
          compact ? "h-[64px]" : "h-[68px]"
        }`}
      >
        <a href="/" className="kr-focus rounded-btn shrink-0">
          <Logo showByline={!compact} />
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href="/compare"
            className="kr-focus hidden sm:inline-flex rounded-btn text-sm font-medium text-ink-soft hover:text-ink transition-colors px-3 py-2"
          >
            Compare
          </a>
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("cta_signup", { from: "header" })}
            className="kr-focus inline-flex items-center rounded-btn bg-primary text-white text-sm font-semibold px-3.5 sm:px-4 py-2 hover:bg-primary-hover active:bg-primary-active transition-colors shadow-card"
          >
            Free Kickresume account
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-auto">
      <div className="bg-dark text-white px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div>
            <p className="font-display text-lg font-bold">Build the career your skills deserve</p>
            <p className="mt-1 text-sm text-white/70 max-w-md">
              Free AI resume builder, Career Map, resume checker, and job search — used by 5M+
              people on Kickresume.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <a
              href={CREATE_RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_create_resume", { from: "footer" })}
              className="kr-focus inline-flex justify-center rounded-btn bg-primary text-white font-semibold px-5 py-3 hover:bg-primary-hover transition-colors"
            >
              Create a free resume →
            </a>
            <a
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("cta_signup", { from: "footer" })}
              className="kr-focus inline-flex justify-center rounded-btn border border-white/25 text-white font-semibold px-5 py-3 hover:bg-white/10 transition-colors"
            >
              Sign up free
            </a>
          </div>
        </div>
      </div>
      <div className="py-4 text-center text-xs text-ink-soft px-4">
        Skill Half-Life Calculator · by Kickresume · Not career advice.{" "}
        <a href="#methodology" className="underline hover:text-ink">
          Methodology
        </a>
      </div>
    </footer>
  );
}
