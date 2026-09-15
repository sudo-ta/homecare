import type { ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '../utils/cn.js';

/**
 * The wiring every labelled control shares.
 *
 * Spec 9 requires errors to be programmatically associated with their input,
 * not merely rendered near it. Getting that wrong is the single most common
 * accessibility failure in form-heavy products, so it is solved once here and
 * every control is built on top of it rather than each repeating the aria
 * bookkeeping.
 */
export interface FieldIds {
  inputId: string;
  hintId: string | undefined;
  errorId: string | undefined;
  /** Spread straight onto the input element. */
  inputProps: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': true | undefined;
    'aria-required': true | undefined;
  };
}

export function useFieldIds(opts: {
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
}): FieldIds {
  const generated = useId();
  const inputId = opts.id ?? generated;
  const hintId = opts.hint ? `${inputId}-hint` : undefined;
  const errorId = opts.error ? `${inputId}-error` : undefined;

  return {
    inputId,
    hintId,
    errorId,
    inputProps: {
      id: inputId,
      // Error first: a screen reader reads describedby in order, and the
      // problem matters more than the hint once there is one.
      'aria-describedby': cn(errorId, hintId) || undefined,
      'aria-invalid': opts.error ? true : undefined,
      'aria-required': opts.required ? true : undefined,
    },
  };
}

export interface FieldProps {
  label: ReactNode;
  /** Renders as a legend inside a fieldset instead of a label. For groups. */
  as?: 'label' | 'fieldset';
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Marks the surface optional in the label instead of marking required ones. */
  optionalHint?: boolean;
  htmlFor?: string;
  hintId?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  as = 'label',
  hint,
  error,
  required,
  optionalHint = false,
  htmlFor,
  hintId,
  errorId,
  className,
  children,
}: FieldProps) {
  const Wrapper = as === 'fieldset' ? 'fieldset' : 'div';
  const LabelTag = as === 'fieldset' ? 'legend' : 'label';

  return (
    <Wrapper className={cn('flex flex-col gap-1', className)}>
      <LabelTag
        {...(as === 'label' && htmlFor ? { htmlFor } : {})}
        className="text-small font-medium text-ink"
      >
        {label}
        {required && !optionalHint ? (
          <span className="text-critical" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
        {optionalHint && !required ? (
          <span className="font-normal text-ink-soft"> (optional)</span>
        ) : null}
      </LabelTag>

      {hint ? (
        <p id={hintId} className="text-small text-ink-soft">
          {hint}
        </p>
      ) : null}

      {children}

      {error ? (
        <p id={errorId} className="flex items-start gap-0.5 text-small text-critical">
          <svg
            viewBox="0 0 16 16"
            className="mt-0.5 size-2 shrink-0"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.5h1.5v5h-1.5v-5Zm0 6.25h1.5v1.5h-1.5v-1.5Z" />
          </svg>
          <span>{error}</span>
        </p>
      ) : null}
    </Wrapper>
  );
}

/**
 * The border and background every text-entry control shares.
 *
 * Borders use --pewter-strong, not --line. Spec 5.4 says separation is done with
 * --line borders, which is right for dividers and card edges, but --line on
 * --surface measures 1.3:1 and WCAG 1.4.11 asks 3:1 of a control boundary. A
 * form surface a low-vision user cannot find the edge of is a real failure, so
 * interactive controls take the stronger token and decoration keeps --line.
 */
export const controlClasses = cn(
  'w-full rounded-control border bg-surface px-1.5 text-body text-ink',
  'border-pewter-strong placeholder:text-ink-soft',
  'transition-colors duration-(--dur-state) ease-state',
  'hover:border-ink',
  'disabled:cursor-not-allowed disabled:bg-midnight-lo disabled:text-ink-soft disabled:border-line',
  'aria-[invalid]:border-critical aria-[invalid]:bg-critical-lo',
);

/** 48px, matching the minimum hit area. */
export const controlHeight = 'h-6';
