import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { useFieldIds } from './Field.js';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  /** Accepts nodes: the consent checkbox carries links to terms and privacy. */
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, required, className, id, ...rest },
  ref,
) {
  const { inputId, hintId, errorId, inputProps } = useFieldIds({ id, hint, error, required });

  return (
    <div className="flex flex-col gap-0.5">
      {/* The whole row is the label, so the text is part of the hit area and a
          48px touch target is reached without padding the box itself. */}
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-1.5 py-1">
        <span className="relative flex size-3 shrink-0 items-center justify-center">
          <input
            {...rest}
            {...inputProps}
            ref={ref}
            type="checkbox"
            required={required}
            className={cn(
              'peer size-3 cursor-pointer appearance-none rounded-control border bg-surface',
              'border-pewter-strong',
              'checked:border-ink checked:bg-ink',
              'disabled:cursor-not-allowed disabled:border-line disabled:bg-midnight-lo',
              'aria-[invalid]:border-critical',
              'transition-colors duration-(--dur-state) ease-state',
              className,
            )}
          />
          <svg
            viewBox="0 0 16 16"
            className="pointer-events-none absolute size-2 text-paper opacity-0 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m3 8.5 3.5 3.5L13 5" />
          </svg>
        </span>

        <span className="flex flex-col gap-0.5">
          <span className="text-body text-ink">
            {label}
            {required ? (
              <span className="text-critical" aria-hidden="true">
                {' '}
                *
              </span>
            ) : null}
          </span>
          {hint ? (
            <span id={hintId} className="text-small text-ink-soft">
              {hint}
            </span>
          ) : null}
        </span>
      </label>

      {error ? (
        <p id={errorId} className="text-small text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
});
