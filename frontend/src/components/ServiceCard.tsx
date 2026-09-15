import { Link } from 'react-router';
import type { Service } from '@shared/types/index.js';
import { money, priceUnitLabel } from '@/lib/format.js';

/**
 * One service in the catalogue grid.
 *
 * Glass at 24px radius over the tinted band: a translucent fill, a heavy
 * backdrop blur, and a gradient ring painted by mask-composite so the ring is
 * a 1px border rather than a wash over the whole card. The ring cross-fades to
 * a blue one on hover, which is the card's only state change - no lift, no
 * scale, no deepening shadow. Physical elevation is the most common card
 * cliche and it reads cheap.
 *
 * The price and the action live in `.pcard-reveal`, which slides up over the
 * foot of the card on hover. Nothing is reserved for it in flow, so the card
 * has no empty band at rest. On a coarse pointer the reveal is simply part of
 * the card: there is no hover to emulate, and a two-tap reveal would strand the
 * button behind a tap that reads as "open this".
 *
 * Keyboard users get the same thing through :focus-within, so tabbing to the
 * link brings the price into view with it.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="pcard flex flex-1 flex-col">
      <div className="pcard-group">
        <h3 className="text-h3 text-ink">{service.name}</h3>

        <p className="text-small text-ink-soft">{service.qualificationRequired}</p>

        <span aria-hidden="true" className="pcard-rule my-0.75" />

        <p className="text-meta text-pewter-text">{categoryLabel(service)}</p>

        <p className="line-clamp-2 text-small text-ink-soft">{service.summary}</p>

        <div className="pcard-reveal mt-auto grid">
          <div className="pcard-reveal-in flex flex-col gap-1.25 pt-2.25">
            <p className="flex min-h-3.75 items-baseline gap-0.75">
              <span className="font-display text-price tabular-nums text-ink">
                {money(service.basePrice)}
              </span>
              <span className="text-small whitespace-nowrap text-pewter-text">
                {perLabel(service)}
              </span>
            </p>

            <Link
              to={`/services/${service.slug}`}
              className="inline-flex h-5.5 items-center justify-center gap-[7px] rounded-pill border border-[rgba(255,255,255,.85)] bg-[linear-gradient(to_bottom,rgba(255,255,255,.72),rgba(226,234,247,.58))] text-small font-medium text-navy no-underline shadow-[0_10px_24px_-14px_rgba(16,20,31,.5),inset_0_1px_0_rgba(255,255,255,.95),inset_0_-1px_0_rgba(255,255,255,.35)] backdrop-blur-[16px] backdrop-saturate-[190%]"
            >
              View details
              <svg
                viewBox="0 0 24 24"
                className="size-[17px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  nursing: 'Nursing',
  caregiving: 'Caregiving',
  physiotherapy: 'Physiotherapy',
  'doctor-visit': 'Doctor visit',
  diagnostics: 'Diagnostics',
  equipment: 'Equipment',
};

const categoryLabel = (s: Service) => CATEGORY_LABELS[s.category] ?? s.category;

/**
 * The card has room for "per shift", not "per 12-hour shift". The full unit is
 * on the service page and in the pricing table, where the column has the width
 * for it.
 */
const perLabel = (s: Service): string =>
  s.priceUnit === 'per-12-hour-shift' ? 'per shift' : priceUnitLabel(s.priceUnit);
