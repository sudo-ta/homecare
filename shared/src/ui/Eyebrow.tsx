import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export interface EyebrowProps {
  children: ReactNode;
  /** Numbered sections read as a sequence: "01 - What we send". */
  index?: string;
  tone?: 'muted' | 'brass' | 'midnight-lo';
  className?: string;
}

/**
 * The small uppercase monospace label above a heading.
 *
 * This is the imported theme's loudest signature and the easiest thing to lose:
 * the mono face, the 0.2em tracking and the uppercasing are doing the work
 * together, and dropping any one of them turns it back into ordinary small text.
 *
 * It supersedes the earlier brief, which banned decorative eyebrows and all-caps
 * labels outright. Here they are structural rather than decorative - they number
 * the page's sections, so the reader can tell how far through they are.
 *
 * Uppercasing is done in CSS, not in the copy, so a screen reader still
 * announces the words normally rather than spelling them out.
 */
export function Eyebrow({ children, index, tone = 'muted', className }: EyebrowProps) {
  return (
    <span
      className={cn(
        'block font-mono text-eyebrow uppercase',
        tone === 'muted' && 'text-ink-soft',
        tone === 'brass' && 'text-brass-text',
        tone === 'midnight-lo' && 'text-pewter',
        className,
      )}
    >
      {index ? (
        <>
          {index}
          <span aria-hidden="true"> &mdash; </span>
          <span className="sr-only">, </span>
        </>
      ) : null}
      {children}
    </span>
  );
}
