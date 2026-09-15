import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../utils/cn.js';
import { controlClasses, controlHeight, Field, useFieldIds } from './Field.js';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optionalHint?: boolean;
  /** Fixed text inside the surface, such as +91 on a phone number. */
  prefix?: string;
  /** A control rendered flush inside the surface, such as the pincode check. */
  addon?: ReactNode;
  fieldClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    required,
    optionalHint,
    prefix,
    addon,
    className,
    fieldClassName,
    id,
    ...rest
  },
  ref,
) {
  const { inputId, hintId, errorId, inputProps } = useFieldIds({ id, hint, error, required });

  const bare = (
    <input
      {...rest}
      {...inputProps}
      ref={ref}
      required={required}
      className={cn(
        controlClasses,
        controlHeight,
        !!prefix && 'rounded-l-none',
        !!addon && 'rounded-r-none border-r-0',
        className,
      )}
    />
  );

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
      {prefix || addon ? (
        <div className="flex items-stretch">
          {prefix ? (
            <span
              className={cn(
                controlHeight,
                'inline-flex items-center rounded-l-input border border-r-0 border-pewter-strong bg-midnight-lo px-1.5 text-body text-ink-soft',
              )}
              aria-hidden="true"
            >
              {prefix}
            </span>
          ) : null}
          {bare}
          {addon}
        </div>
      ) : (
        bare
      )}
    </Field>
  );
});
