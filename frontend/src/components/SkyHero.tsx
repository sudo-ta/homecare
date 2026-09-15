import type { ReactNode } from 'react';
import { cn } from '@shared/utils/index.js';

/**
 * The gradient sky.
 *
 * The one place this design spends saturated colour, and the reason everything
 * beneath it can stay neutral. Layers, bottom to top:
 *
 *   1. A vertical ramp that holds solid blue for the top third and then falls
 *      through eleven stops to white. Holding the top flat is what lets the
 *      headline sit on a known colour instead of on whatever the gradient
 *      happens to be doing at that scroll position.
 *   2. A deep orb top-left, which deepens the corner the headline starts in.
 *   3. A warm orb and a white orb low down. The warm one is the only warmth in
 *      the palette and stops the blue reading cold.
 *   4. A soft dark scrim behind the centre column. This is what guarantees the
 *      white type, rather than the orbs happening to land in the right place.
 *   5. A white wash over the bottom sixth, so the gradient dissolves rather
 *      than stopping on a line.
 *
 * Everything is a blurred shape rather than an image: no request, no decode,
 * and it scales to any viewport without a breakpoint.
 *
 * data-surface="sky" swaps the focus ring to white here. Brass measures 1.9:1
 * against this blue, so the standard ring would disappear exactly where the
 * pincode field sits.
 */
export function SkyHero({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section data-surface="sky" className={cn('relative isolate overflow-hidden', className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-sky-1)_0%,var(--color-sky-1)_30%,#1d4399_46%,var(--color-sky-2)_58%,var(--color-sky-3)_68%,var(--color-sky-4)_76%,var(--color-sky-5)_84%,var(--color-sky-6)_90%,#d3dff0_95%,#eef3fa_98%,#fff_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[300px] -left-[280px] -z-10 h-[min(880px,110vh)] w-[min(1600px,200vw)] rounded-pill opacity-92 blur-[150px] bg-[linear-gradient(180deg,var(--color-sky-deep)_0%,var(--color-sky-1)_52%,#7593c4_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[min(52vh,460px)] left-[min(58vw,860px)] -z-10 h-[min(640px,86vh)] w-[min(700px,100vw)] rounded-pill bg-sky-warm opacity-42 blur-[96px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[min(70vh,620px)] left-10 -z-10 h-[min(560px,72vh)] w-[min(900px,120vw)] rounded-pill bg-surface opacity-50 blur-[96px]"
      />

      {/* The scrim. Without it the headline's contrast depends on where the
          orbs land, which is not a guarantee at every viewport width. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[88%] w-[min(1180px,96vw)] -translate-x-1/2 blur-[30px] bg-[radial-gradient(56%_54%_at_50%_38%,rgba(8,24,64,.5)_0%,rgba(8,24,64,.26)_48%,rgba(8,24,64,0)_78%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[16%] bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0%,rgba(255,255,255,.18)_42%,rgba(255,255,255,.55)_70%,rgba(255,255,255,.86)_88%,#fff_100%)]"
      />

      {children}
    </section>
  );
}

/**
 * The inner-page hero: the same blue, shorter, with a breadcrumb.
 *
 * Coverage, Articles and Contact all open on this. It is left-aligned rather
 * than centred, because those pages carry a breadcrumb and a centred crumb
 * reads as decoration.
 */
export function PageHero({
  crumb,
  title,
  intro,
  centered = false,
  children,
}: {
  crumb: string;
  title: ReactNode;
  intro?: ReactNode;
  centered?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      data-surface="sky"
      className="relative -mt-11.5 overflow-hidden border-b border-line pt-11.5"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--color-sky-1)_0%,#1c4399_34%,#2b5099_58%,#4b6aac_76%,#8ba7d4_90%,#e7eef8_100%)]"
      />

      <div
        className={cn(
          'relative mx-auto w-full max-w-[1240px] px-(--page-gutter) pt-[clamp(2.25rem,5.5vw,4.5rem)] pb-[clamp(2.5rem,6vw,5rem)]',
          centered && 'flex flex-col items-center text-center',
        )}
      >
        <nav aria-label="Breadcrumb" className="mb-2 text-small text-surface/75">
          <a href="/" className="text-surface/85 no-underline">
            Home
          </a>
          <span aria-hidden="true" className="px-1">
            /
          </span>
          <span className="text-surface">{crumb}</span>
        </nav>

        <h1 className="max-w-[24ch] text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.04] tracking-[-.035em] text-surface">
          {title}
        </h1>

        {intro ? (
          <p className="mt-1.5 max-w-[56ch] text-[clamp(1rem,1.5vw,1.15rem)] leading-[1.5] text-surface/92">
            {intro}
          </p>
        ) : null}

        {children}
      </div>
    </section>
  );
}
