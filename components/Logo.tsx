interface Props {
  className?: string;
  showByline?: boolean;
}

/**
 * Kickresume-branded wordmark for the Skill Half-Life Calculator.
 * The coral mark is a stylised half-filled hourglass — a visual nod to
 * skills that decay over time.
 */
export default function Logo({ className = "", showByline = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="grid place-items-center rounded-[10px] bg-primary shadow-card"
        style={{ width: 34, height: 34 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 3h12M6 21h12"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6 3c0 4.5 3 6 6 9 3-3 6-4.5 6-9M6 21c0-4.5 3-6 6-9 3 3 6 4.5 6 9"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 18.2c1-1.3 2-2 3-2s2 .7 3 2z" fill="#fff" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[15px] sm:text-base font-bold tracking-tight text-ink-strong">
          Skill Half-Life
        </span>
        {showByline && (
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-soft">
            by Kickresume
          </span>
        )}
      </span>
    </span>
  );
}
