import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export type BadgeTone = 'neutral' | 'verified' | 'positive' | 'attention' | 'critical' | 'strong';

/**
 * Badge tones.
 *
 * In the imported theme the brass is the general link and label colour rather
 * than a scarce one, so a verified credential is distinguished by the brass
 * TEXT on a midnight-lo surface while ordinary metadata stays in --ink-soft.
 *
 * A verification badge is never a neutral grey: a grey badge reads as disabled
 * rather than as trusted, and verification is the single most important signal
 * on this site.
 */
const TONES: Record<BadgeTone, string> = {
  // Metadata. Carries no meaning beyond the words in it.
  neutral: 'bg-midnight-lo text-ink-soft border-transparent',
  // Accent text on the midnight-lo surface: 8.4:1, comfortably past AA.
  verified: 'bg-midnight-lo text-brass-text border-midnight-lo',
  positive: 'bg-positive-lo text-positive border-positive-lo',
  attention: 'bg-attention-lo text-attention border-attention-lo',
  critical: 'bg-critical-lo text-critical border-critical-lo',
  strong: 'bg-ink text-paper border-ink',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-pill border px-1 py-0.25 text-meta font-medium',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * The verification mark.
 *
 * Carries its own text rather than being a bare tick. A family deciding whether
 * to let a stranger into the house should be told what was checked, not shown a
 * decoration - and a lone icon is invisible to a screen reader anyway.
 */
export function VerifiedBadge({
  label = 'Verified',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      tone="verified"
      className={className}
      icon={
        <svg viewBox="0 0 16 16" className="size-2" fill="currentColor" aria-hidden="true">
          <path d="M8 1 9.9 2.4l2.3-.2.7 2.2 1.9 1.3-.9 2.2.9 2.2-1.9 1.3-.7 2.2-2.3-.2L8 15l-1.9-1.4-2.3.2-.7-2.2L1.2 10.3l.9-2.2-.9-2.2 1.9-1.3.7-2.2 2.3.2L8 1Zm-.8 9.7 3.9-3.9-1.1-1.1-2.8 2.8-1.3-1.3-1.1 1.1 2.4 2.4Z" />
        </svg>
      }
    >
      {label}
    </Badge>
  );
}

/**
 * A published price.
 *
 * The imported theme sets prices in the monospace face, which is what makes a
 * column of them align and read as published figures rather than as prose.
 *
 *   tone="quiet"  (default) - a price in a list or a table.
 *   tone="marked"           - the single headline price on a service page,
 *                             where it is the one figure the reader came for.
 */
export function Price({
  amount,
  unit,
  tone = 'quiet',
  className,
}: {
  amount: string;
  unit?: string;
  tone?: 'quiet' | 'marked';
  className?: string;
}) {
  return (
    <p className={cn('text-body', className)}>
      <span className={cn('font-semibold', tone === 'marked' ? 'text-brass-text' : 'text-ink')}>
        {amount}
      </span>
      {unit ? <span className="text-ink-soft"> {unit}</span> : null}
    </p>
  );
}
