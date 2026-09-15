import type { ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { controlClasses, controlHeight, Field, useFieldIds } from './Field.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: ReactNode;
  options: SelectOption[];
  hint?: ReactNode;
  error?: ReactNode;
  optionalHint?: boolean;
  /** Shown as a disabled first option. Use a real instruction, not "Select...". */
  placeholder?: string;
  fieldClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    hint,
    error,
    required,
    optionalHint,
    placeholder,
    className,
    fieldClassName,
    id,
    ...rest
  },
  ref,
) {
  const { inputId, hintId, errorId, inputProps } = useFieldIds({ id, hint, error, required });

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalHint={optionalHint}
      htmlFor={inputId}
      hintId={hintId}
      errorId={errorId}
      className={fieldClassName}
    >
      <div className="relative">
        <select
          {...rest}
          {...inputProps}
          ref={ref}
          required={required}
          className={cn(
            controlClasses,
            controlHeight,
            // Room for the chevron, and the native one is suppressed so the
            // control looks the same across browsers.
            'cursor-pointer appearance-none pr-5',
            className,
          )}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 right-1.5 size-2 -translate-y-1/2 text-ink-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </div>
    </Field>
  );
});
