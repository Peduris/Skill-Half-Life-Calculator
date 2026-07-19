import { SOURCES } from "@/lib/seed";

export default function Methodology() {
  return (
    <section id="methodology" className="w-full max-w-3xl mx-auto scroll-mt-24">
      <div className="bg-surface border border-line rounded-[24px] p-6 sm:p-8 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink-strong mb-1">Methodology &amp; sources</h2>
        <p className="text-sm text-ink-soft mb-5">
          This is a conversation-starter, not a horoscope. Here&apos;s exactly how the number is built —
          and every source behind it.
        </p>

        <ol className="list-decimal list-inside space-y-2 text-sm text-ink mb-6 marker:text-primary marker:font-bold">
          <li>
            <strong>Classify.</strong> Each skill you enter is matched to one of the 31 Lightcast Open
            Skills categories — first by fuzzy-matching a curated seed list, then by keyword/category
            fallback.
          </li>
          <li>
            <strong>Score decay.</strong> Each category maps to a <em>half-life</em> (in years) and a
            trend, drawn from IBM&apos;s skills half-life tiers (perishable &lt;2.5yr / semi-durable
            2.5–7.5yr / durable &gt;7.5yr) and the WEF Future of Jobs 2025 growing/declining skill lists.
          </li>
          <li>
            <strong>Blend.</strong> Your headline half-life is the (equal-weighted) average of your
            skills&apos; half-lives, rounded to one decimal place.
          </li>
          <li>
            <strong>Honesty layer.</strong> Durable human skills — leadership, communication, judgment —
            visibly pull your average up, and we cite the WEF evidence inline so it reads as earned.
          </li>
        </ol>

        <p className="text-xs text-ink-soft mb-6">
          Half-lives are estimates for illustration and discussion, grounded in published research —
          not a prediction about any individual&apos;s career. The one-decimal precision is a deliberate
          bit of theatre.
        </p>

        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft mb-3">Sources</h3>
        <ul className="space-y-3">
          {SOURCES.map((s) => (
            <li key={s.url} className="text-sm border-l-2 border-line pl-3">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline decoration-primary/40 hover:decoration-primary hover:text-primary transition-colors"
              >
                {s.source_name}
              </a>
              <span className="text-ink-soft"> · {s.type}</span>
              <p className="text-xs text-ink-soft mt-0.5">{s.key_stat_or_use}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
