import type { ReactNode } from 'react';
import { cn } from '@shared/utils/index.js';

export interface SectionProps {
  id?: string;
  /** Tinted bands break up a long page without needing a shadow or a rule. */
  tone?: 'paper' | 'tinted';
  spacing?: 'default' | 'tight';
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  tone = 'paper',
  spacing = 'default',
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        tone === 'tinted' && 'border-y border-line bg-midnight-lo',
        spacing === 'tight' ? 'section-y-sm' : 'section-y',
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

export interface SectionHeadingProps {
  title: ReactNode;
  /** Two lines or fewer. Spec 5.4 permits centring only at that length. */
  intro?: ReactNode;
  /** A link or button sitting opposite the heading on wide screens. */
  aside?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}

/**
 * No eyebrow label. Spec 5.3 allows one only when it carries information the
 * heading does not, and on a marketing page it almost never does, so the
 * component does not offer the slot.
 */
export function SectionHeading({
  title,
  intro,
  aside,
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-2 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex flex-col gap-1">
        <Tag className={Tag === 'h2' ? 'text-h2' : 'text-h3'}>{title}</Tag>
        {intro ? <p className="measure text-body-lg text-ink-soft">{intro}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}
