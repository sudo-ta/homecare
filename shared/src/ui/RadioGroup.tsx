import type { ReactNode } from 'react';
import { useId } from 'react';
import { cn } from '../utils/cn.js';
import { Field } from './Field.js';

export interface RadioOption {
  value: string;
  label: ReactNode;
  /** A second line under the label. Use it to say what the option means. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label: ReactNode;
  name: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** `card` gives each option a bordered box. Better on touch and for long labels. */
  appearance?: 'inline' | 'card';
  columns?: 1 | 2;
  className?: string;
}

/**
 * A fieldset with a legend, not a div with a floating label. The grouping is
 * what tells a screen reader that these radios answer one question.
 */
export function RadioGroup({
  label,
  name,
  options,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  required,
  appearance = 'card',
  columns = 1,
  className,
}: RadioGroupProps) {
  const base = useId();
  const hintId = hint ? `${base}-hint` : undefined;
  const errorId = error ? `${base}-error` : undefined;

  return (
    <Field
      as="fieldset"
      label={label}
      hint={hint}
      error={error}
      required={required}
      hintId={hintId}
      errorId={errorId}
      className={className}
    >
      <div
        role="radiogroup"
        aria-describedby={cn(errorId, hintId) || undefined}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={cn('grid gap-1', columns === 2 && 'sm:grid-cols-2')}
      >
        {options.map((o) => {
          const id = `${base}-${o.value}`;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={cn(
                'flex cursor-pointer items-start gap-1.5',
                appearance === 'card'
                  ? cn(
                      'rounded-card border bg-surface p-1.5',
                      'border-pewter-strong hover:border-ink',
                      'has-checked:border-ink has-checked:bg-midnight-lo',
                      'has-disabled:cursor-not-allowed has-disabled:border-line has-disabled:bg-paper',
                      'transition-colors duration-(--dur-state) ease-state',
                    )
                  : 'py-1',
              )}
            >
              <span className="relative flex size-3 shrink-0 items-center justify-center">
                <input
                  type="radio"
                  id={id}
                  name={name}
                  value={o.value}
                  disabled={o.disabled}
                  {...(value !== undefined
                    ? { checked: value === o.value }
                    : { defaultChecked: defaultValue === o.value })}
                  onChange={(e) => onChange?.(e.target.value)}
                  className={cn(
                    'peer size-3 cursor-pointer appearance-none rounded-pill border bg-surface',
                    'border-pewter-strong checked:border-ink',
                    'disabled:cursor-not-allowed disabled:border-line disabled:bg-midnight-lo',
                    'transition-colors duration-(--dur-state) ease-state',
                  )}
                />
                <span className="pointer-events-none absolute size-1.5 rounded-pill bg-ink opacity-0 peer-checked:opacity-100" />
              </span>

              <span className="flex flex-col gap-0.5">
                <span className="text-body text-ink">{o.label}</span>
                {o.description ? (
                  <span className="text-small text-ink-soft">{o.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}
