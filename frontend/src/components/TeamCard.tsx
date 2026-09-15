import type { Professional } from '@shared/types/index.js';
import { initials, roleLabel, years } from '@/lib/format.js';

/**
 * A professional's profile card, as it appears on the home page.
 *
 * This is the single biggest trust lever on the page: a family is deciding
 * whether to let a stranger into the house. What makes it work is specificity -
 * a name, a real qualification, and a list of what was actually checked rather
 * than a decorative tick.
 *
 * The badge is a filled brass disc sitting against the name, because that is
 * the one place verification is being claimed and brass is the colour that
 * means it. The tick reverses out in white at 4.9:1. Brass is never spent
 * anywhere else on this card, so the mark keeps its meaning.
 *
 * The avatar is initials in the accent tint, not a photograph. No consented
 * photographs exist, and a stock face on a card that claims a real verified
 * person would be the worst possible thing to fake.
 *
 * Languages and working areas are deliberately not here: the home page card
 * carries what decides trust, and the full detail is on /professionals.
 * No contact details are ever rendered.
 */
export function TeamCard({ professional: p }: { professional: Professional }) {
  return (
    <article className="flex flex-1 flex-col gap-2 rounded-feature border border-[rgba(255,255,255,.85)] bg-[rgba(255,255,255,.62)] p-3 pb-3 shadow-[0_26px_56px_-34px_rgba(16,20,31,.4),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-[22px] backdrop-saturate-[180%]">
      <div className="flex items-start gap-1.75">
        <span
          aria-hidden="true"
          className="grid size-6.5 shrink-0 place-items-center rounded-pill border border-[rgba(48,86,167,.2)] bg-[rgba(48,86,167,.1)] font-display text-body-lg text-accent"
        >
          {initials(p.fullName)}
        </span>

        <div className="flex min-w-0 flex-col gap-[3px]">
          <h3 className="flex items-center gap-1 text-h3">
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
          <p className="text-meta text-pewter-text">{p.qualification}</p>
        </div>
      </div>

      <p className="line-clamp-3 text-small text-ink-soft">{p.bio}</p>

      <div className="mt-auto flex flex-col gap-1.25 border-t border-[rgba(21,26,40,.12)] pt-2.25">
        <ul className="flex flex-col gap-[7px]">
          {p.verifiedChecks.map((c) => (
            <li key={c} className="flex items-start gap-[9px] text-small text-ink-soft">
              <svg
                viewBox="0 0 24 24"
                className="mt-[3px] size-[15px] shrink-0"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="2.6"
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
