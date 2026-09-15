import type { ReactNode } from 'react';
import { useRevealOnce } from '@/lib/motion.js';

/**
 * Section entrance, fired once when the section first crosses into view.
 *
 * HARD LIMIT: at most three uses on the home page, and none anywhere else on
 * the site. Wrapping every block in this is the single clearest signature of
 * generated design, and it is the first thing that makes a page feel templated
 * rather than considered. A test enforces the count.
 *
 * Off below 768px - the CSS opts out entirely. Scroll-linked motion on a
 * mid-range Android costs frames and buys nothing, and that is the hardware
 * most of this audience is holding.
 *
 * Off under prefers-reduced-motion, where the content renders in its final
 * state immediately.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, revealed } = useRevealOnce<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-motion="reveal"
      data-revealed={revealed ? '' : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
