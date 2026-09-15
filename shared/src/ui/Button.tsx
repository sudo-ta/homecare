import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'primary-on-dark'
  | 'secondary-on-dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Buttons are fully rounded. The pill is the one soft gesture in an otherwise
 * disciplined system, so it is not configurable and is never normalised to
 * match the cards.
 *
 * Neither pewter nor brass is ever a fill here. Pewter is structural and would
 * read as disabled; brass is semantic and is spent on verification and the
 * focus ring.
 *
 * The two -on-dark variants exist because the closing CTA is a midnight band,
 * and the standard variants disappear against it.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-midnight text-paper hover:bg-ink active:bg-ink disabled:bg-ink-soft',
  secondary:
    'bg-transparent text-midnight border border-midnight hover:bg-midnight-lo active:bg-midnight-lo disabled:border-line disabled:text-ink-soft',
  ghost:
    'bg-transparent text-midnight hover:bg-midnight-lo active:bg-midnight-lo disabled:text-ink-soft',
  destructive: 'bg-critical text-paper hover:bg-ink active:bg-ink disabled:bg-ink-soft',

  'primary-on-dark': 'bg-paper text-midnight hover:bg-midnight-lo active:bg-midnight-lo',
  // Pewter, not ink-soft, for the border: ink-soft measures 2.33:1 on midnight
  // and leaves the button edge invisible. Pewter measures 5.54:1.
  'secondary-on-dark':
    'bg-transparent text-paper border border-pewter hover:bg-ink active:bg-ink',
};

/**
 * Every size clears the 48px minimum hit area. `sm` is visually 40px, so it
 * carries .tap-target, which grows the touch region to 48px without changing
 * how the control looks.
 *
 * md is 24px of horizontal padding at 15px/500, which is the spec's button
 * type. text-small is 15px.
 */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-5 px-2 text-meta gap-1 tap-target',
  md: 'h-6 px-3 text-small gap-1',
  lg: 'h-7 px-4 text-body gap-1.5',
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, blocks the click and marks the control busy. */
  loading?: boolean;
  /** Announced while loading. Say what is happening, not just "Loading". */
  loadingLabel?: string;
  fullWidth?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children: ReactNode;
}

/** Shared by Button and by links that need to look like one. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  fullWidth = false,
): string {
  return cn(
    'inline-flex items-center justify-center rounded-pill font-medium no-underline',
    'transition-colors duration-(--dur-state) ease-state',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel = 'Working',
    fullWidth = false,
    iconStart,
    iconEnd,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses(variant, size, fullWidth), className)}
    >
      {loading ? <Spinner /> : iconStart}
      <span>{children}</span>
      {loading ? null : iconEnd}
      {/* The spinner alone conveys nothing to a screen reader. This does the
          telling. The spinner itself keeps turning under prefers-reduced-motion
          on purpose: it is the system saying it is working, not decoration, and
          a submitted booking with no sign of life is worse than movement. */}
      {loading ? (
        <span role="status" className="sr-only">
          {loadingLabel}
        </span>
      ) : null}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="size-2.5 shrink-0 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path
        d="M14.5 8A6.5 6.5 0 0 0 8 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
