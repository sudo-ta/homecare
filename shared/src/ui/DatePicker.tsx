import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { controlClasses, controlHeight, Field, useFieldIds } from './Field.js';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'type'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optionalHint?: boolean;
  /** `date` or `time`. Both map to a native control. */
  mode?: 'date' | 'time';
  /** Convenience for "no earlier than today". */
  notBeforeToday?: boolean;
  fieldClassName?: string;
}

/** Local date as YYYY-MM-DD. toISOString would shift the day for IST. */
function todayLocal(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Wraps the native date and time inputs rather than rendering a custom calendar.
 *
 * On a phone the native control opens the OS picker, which is already
 * localised, already keyboard and screen-reader complete, and already familiar
 * to an older user. A hand-built calendar grid would be worse on every one of
 * those counts, and this audience is exactly the one that would feel it.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    label,
    hint,
    error,
    required,
    optionalHint,
    mode = 'date',
    notBeforeToday = false,
    min,
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
      <input
        {...rest}
        {...inputProps}
        ref={ref}
        type={mode}
        required={required}
        min={min ?? (notBeforeToday && mode === 'date' ? todayLocal() : undefined)}
        className={cn(controlClasses, controlHeight, className)}
      />
    </Field>
  );
});
