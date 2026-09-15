import type { ReactNode } from 'react';
import { cn } from '@shared/utils/index.js';

/**
 * The booking flow's own controls.
 *
 * Every choice in this flow is a visible option rather than a collapsed
 * <select>. On a form where someone is deciding between "a few visits" and
 * "ongoing, daily" while worried, seeing all four at once is worth the space,
 * and it removes a tap on mobile.
 *
 * These are buttons with aria-pressed rather than real radios, which is what
 * the design specifies. Each group sits inside a <fieldset> with a <legend>, so
 * the group still announces its own name, and the pressed state carries the
 * selection.
 */

/** One option in a single-select pill group. */
export function OptionPill({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'opt tap-target cursor-pointer rounded-pill border px-[15px] py-[9px] text-small whitespace-nowrap',
        selected
          ? 'border-blue bg-blue font-medium text-surface'
          : 'border-line bg-surface text-pewter-text',
      )}
    >
      {label}
    </button>
  );
}

/**
 * A service choice: a wide card with a radio dot, because the label is long
 * enough that a pill would either wrap or truncate to nothing useful.
 */
export function ServiceOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'opt flex cursor-pointer items-center gap-1.25 rounded-panel border px-[13px] py-1.25 text-left text-small text-ink',
        selected ? 'border-blue bg-[rgba(26,65,153,.06)]' : 'border-line bg-surface',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-2 shrink-0 place-items-center rounded-pill border',
          selected ? 'border-blue bg-blue' : 'border-pewter bg-surface',
        )}
      >
        <span
          className={cn('size-[7px] rounded-pill', selected ? 'bg-surface' : 'bg-transparent')}
        />
      </span>
      {/* Wraps rather than truncating: a clipped service name is useless. */}
      <span className="min-w-0 leading-[1.25]">{label}</span>
    </button>
  );
}

/**
 * A collapsed optional section.
 *
 * Preferences are the only part of this form nobody has to answer, so they sit
 * behind a disclosure rather than lengthening the step everyone does have to
 * read. Closed by default, and a native <details> so it works before hydration.
 */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group rounded-[14px] border border-line px-1.75 py-[11px]">
      <summary className="flex cursor-pointer list-none items-center gap-1 text-small font-medium text-blue-deep [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 24 24"
          className="size-[15px] shrink-0 transition-[rotate] duration-(--dur-state) ease-state group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        {summary}
      </summary>
      <div className="mt-1.5 grid items-start gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        {children}
      </div>
    </details>
  );
}

/** A multi-select pill, with a checkbox rather than a radio dot. */
export function CheckPill({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        'opt tap-target inline-flex cursor-pointer items-center gap-1 rounded-pill border px-[14px] py-[9px] text-small',
        selected ? 'border-blue bg-[rgba(26,65,153,.06)] text-ink' : 'border-line bg-surface text-pewter-text',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid size-[15px] shrink-0 place-items-center rounded-[4px] border',
          selected ? 'border-blue bg-blue' : 'border-pewter bg-surface',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn('size-[11px]', selected ? 'opacity-100' : 'opacity-0')}
          fill="none"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {label}
    </button>
  );
}

/**
 * A consent checkbox with the statement as its own label.
 *
 * The statement is the button's content rather than a sibling, so the whole
 * sentence is the hit target and there is no way to tick one of these without
 * having the text under the pointer.
 */
export function ConsentCheck({
  checked,
  onToggle,
  invalid,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      aria-invalid={invalid || undefined}
      className="flex cursor-pointer items-start gap-1.25 border-0 bg-transparent p-0 text-left text-small leading-[1.45] text-ink"
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-[1px] grid size-[19px] shrink-0 place-items-center rounded-[5px] border',
          checked ? 'border-blue bg-blue' : invalid ? 'border-critical bg-surface' : 'border-pewter bg-surface',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn('size-1.5', checked ? 'opacity-100' : 'opacity-0')}
          fill="none"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      {children}
    </button>
  );
}

/** A labelled field wrapper. */
export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-small font-medium">
        {label}
        {optional ? <span className="font-normal text-ink-soft"> (optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small text-critical">
          {error}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}

/** Shared classes for every text input, textarea and date field in the flow. */
export const fieldClasses = (invalid?: boolean): string =>
  cn(
    'fld w-full rounded-panel border bg-surface px-1.75 text-body text-ink',
    invalid ? 'border-critical' : 'border-line',
  );

/** A group of options under a legend. */
export function OptionGroup({
  legend,
  optional,
  error,
  children,
  className,
}: {
  legend: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-1.25">
      <legend className="text-small font-medium">
        {legend}
        {optional ? <span className="font-normal text-ink-soft"> (optional)</span> : null}
      </legend>
      <div className={className ?? 'flex flex-wrap gap-1'}>{children}</div>
      {error ? <p className="text-small text-critical">{error}</p> : null}
    </fieldset>
  );
}

/**
 * Progress.
 *
 * Four bars rather than numbered circles. The bar fills for every step reached,
 * so the shape of the whole flow and the distance left are both readable at a
 * glance, which a circle with a tick is worse at.
 */
export function StepBars({
  steps,
  current,
}: {
  steps: { id: string; label: string }[];
  current: number;
}) {
  return (
    <ol aria-label="Progress" className="grid grid-cols-4 gap-1">
      {steps.map((step, i) => (
        <li
          key={step.id}
          aria-current={i === current ? 'step' : undefined}
          className="flex flex-col gap-[7px]"
        >
          <span
            aria-hidden="true"
            className={cn('h-[3px] rounded-pill', i <= current ? 'bg-blue' : 'bg-line')}
          />
          <span
            className={cn(
              'text-meta',
              i === current ? 'font-semibold text-ink' : 'text-pewter-text',
            )}
          >
            <span className="sr-only">
              Step {i + 1} of {steps.length}:{' '}
            </span>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
