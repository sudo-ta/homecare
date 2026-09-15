import type { Professional } from '@shared/types/index.js';
import { initials, roleLabel, years } from '@/lib/format.js';

/**
 * A professional, as a row on the home page.
 *
 * A row rather than a card, because the bio is the part that earns trust and a
 * card clamps it to three lines. Identity sits in the left column and the
 * evidence in the right, so a reader scanning three people compares like with
 * like down the page.
 *
 * The badge is a filled brass disc against the name: that is the one place
 * verification is being claimed, and brass is the colour that means it. The
 * checks beneath repeat the brass as small ticks, which is the only other place
 * it appears here, so the mark keeps its meaning.
 *
 * The avatar is initials in the accent tint, not a photograph. No consented
 * photographs exist, and a stock face on a row claiming a verified person would
 * be the worst possible thing to fake. No contact details are ever rendered.
 */
export function TeamCard({ professional: p }: { professional: Professional }) {
  return (
    <article className="grid items-start gap-2.25 gap-x-[clamp(1.75rem,4vw,3.5rem)] border-t border-[rgba(21,26,40,.14)] py-[clamp(1.5rem,3vw,2rem)] md:[grid-template-columns:minmax(240px,300px)_minmax(0,1fr)]">
      <div className="flex items-start gap-1.75">
        <span
          aria-hidden="true"
          className="grid size-6.5 shrink-0 place-items-center rounded-pill border border-[rgba(48,86,167,.2)] bg-[rgba(48,86,167,.1)] font-display text-body-lg text-accent"
        >
          {initials(p.fullName)}
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="flex items-center gap-1 text-[1.5rem] leading-[1.14] tracking-[-.02em]">
            {p.fullName}
            <span className="grid size-[19px] shrink-0 place-items-center rounded-pill bg-brass">
              <span className="sr-only">Verified</span>
              <svg
                viewBox="0 0 24 24"
                className="size-1.5"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
          </h3>

          <p className="text-small text-ink-soft">
            {roleLabel(p.role)} &middot; {years(p.experienceYears)}
          </p>
          <p className="text-meta leading-[1.45] text-pewter-text">{p.qualification}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.75">
        <p className="max-w-[74ch] text-[.96875rem] leading-[1.6] text-ink-soft">{p.bio}</p>

        <ul className="flex flex-wrap gap-x-2.5 gap-y-0.75">
          {p.verifiedChecks.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-[7px] text-meta whitespace-nowrap text-brass-text"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[13px] shrink-0"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
