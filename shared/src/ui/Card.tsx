import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `tinted` sits on a section band; `plain` has no border, for bare grouping. */
  variant?: 'default' | 'tinted' | 'plain';
  /**
   * Turns the whole card into one click target via a stretched link.
   * The anchor still owns the accessible name, so the card is one tab stop.
   */
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Cards are 8px radius (spec 5.4) and separated by a --line border, not a
 * shadow. There is no hover lift: spec 5.6 names it as part of the generic
 * signature, so interactive cards change their border instead.
 */
export function Card({ variant = 'default', interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-card',
        variant === 'default' && 'border border-line bg-surface',
        variant === 'tinted' && 'border border-line bg-midnight-lo',
        // Border colour only. Physical elevation on hover is the most common
        // card cliche and it reads cheap; the brass rule inside the card is
        // what actually signals the affordance.
        interactive &&
          'group relative transition-colors duration-(--dur-hover) ease-state hover:border-pewter-strong focus-within:border-pewter-strong',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Stretches a link over its nearest positioned ancestor. Pair with
 * `<Card interactive>` so the card is clickable while the anchor text stays
 * the accessible name.
 */
export function CardLinkOverlay({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...rest} className={cn('absolute inset-0', className)} />;
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('p-2 md:p-3', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('border-b border-line p-2 md:px-3', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn('border-t border-line p-2 md:px-3', className)}>
      {children}
    </div>
  );
}
