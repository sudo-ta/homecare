import type { ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { controlClasses, Field, useFieldIds } from './Field.js';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optionalHint?: boolean;
  /** Shows a live remaining-characters count. Needs maxLength and value. */
  showCount?: boolean;
  fieldClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hint,
    error,
    required,
    optionalHint,
    showCount,
    maxLength,
    value,
    className,
    fieldClassName,
    id,
    rows = 4,
    ...rest
  },
  ref,
) {
  const { inputId, hintId, errorId, inputProps } = useFieldIds({ id, hint, error, required });
  const used = typeof value === 'string' ? value.length : 0;
  const remaining = maxLength ? maxLength - used : null;

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
      <textarea
        {...rest}
        {...inputProps}
        ref={ref}
        rows={rows}
        required={required}
        maxLength={maxLength}
        value={value}
        className={cn(controlClasses, 'resize-y py-1.5 leading-normal', className)}
      />
      {showCount && remaining !== null ? (
        <p
          className={cn('text-small', remaining <= 20 ? 'text-attention' : 'text-ink-soft')}
          // Polite so it does not interrupt while the user is still typing.
          aria-live="polite"
        >
          {remaining} characters left
        </p>
      ) : null}
    </Field>
  );
});
