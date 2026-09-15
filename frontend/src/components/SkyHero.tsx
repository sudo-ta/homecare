import type { ReactNode } from 'react';
import { cn } from '@shared/utils/index.js';

/**
 * The gradient sky.
 *
 * The one place this design spends saturated colour, and the reason everything
 * beneath it can stay neutral. Four layers, in order:
 *
 *   1. A vertical gradient through six blue stops, resolving to white at the
 *      base. Because it ends in white it needs no divider against the section
 *      below - the seam simply is not there.
 *   2. A deep blurred orb behind the headline, which keeps the top-left dark
 *      enough for white type to hold.
 *   3. A warm orb low-left and a white orb low-right. The warm one is the only
 *      warmth in the palette and stops the blue reading cold.
 *   4. A white wash over the bottom fifth, which is what makes the gradient
 *      dissolve rather than stop.
 *
 * Everything is a blurred radial shape rather than an image: no request, no
 * decode, and it scales to any viewport without a breakpoint.
 *
 * data-surface="sky" swaps the focus ring to white here. Brass measures 1.9:1
 * against the top of this gradient, so the standard ring would disappear
 * exactly where the pincode field sits.
 */
export function SkyHero({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      data-surface="sky"
      className={cn('relative isolate overflow-hidden', className)}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-sky-1)_0%,var(--color-sky-2)_30%,var(--color-sky-3)_52%,var(--color-sky-4)_70%,var(--color-sky-5)_84%,var(--color-sky-6)_94%,#fff_100%)]"
      />

      {/* The deep orb. Keeps the top dark enough for white type. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[300px] -left-[280px] -z-10 h-[min(880px,110vh)] w-[min(1600px,200vw)] rounded-pill opacity-90 blur-[130px] bg-[linear-gradient(180deg,var(--color-sky-deep)_0%,#1e429f_50%,#3056a7_100%)]"
      />

      {/* The warm orb: the only warmth in the palette, and what stops the blue
          reading cold. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[2%] -left-[6%] -z-10 h-[min(520px,54vh)] w-[min(780px,92vw)] rounded-pill bg-sky-warm opacity-50 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] -bottom-[14%] -z-10 h-[min(560px,58vh)] w-[min(900px,105vw)] rounded-pill bg-surface opacity-60 blur-[110px]"
      />

      {/* The dissolve. Without this the gradient ends on a line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[20%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,.35)_52%,rgba(255,255,255,.82)_80%,#fff_100%)]"
      />

      {children}
    </section>
  );
}
