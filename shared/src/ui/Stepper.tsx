import { cn } from '../utils/cn.js';

export interface Step {
  id: string;
  label: string;
}

export interface StepperProps {
  steps: Step[];
  /** Zero-based index of the step being worked on. */
  current: number;
  /** Jump back to a completed step. Omit to make the stepper display-only. */
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * The booking flow's progress indicator.
 *
 * Numbered because the steps are genuinely sequential, which spec 5.3 sets as
 * the bar for using numbered markers at all.
 *
 * On a 375px viewport the labels would wrap into an unreadable stack, so
 * narrow screens get the rail plus a single "Step 2 of 4" line instead.
 */
export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  const total = steps.length;
  const safeCurrent = Math.min(Math.max(current, 0), total - 1);
  const currentStep = steps[safeCurrent];

  return (
    <nav aria-label="Booking progress" className={className}>
      <ol className="flex items-center gap-0.5">
        {steps.map((step, i) => {
          const done = i < safeCurrent;
          const active = i === safeCurrent;
          const reachable = done && onStepClick;

          const marker = (
            <span
              className={cn(
                'flex size-3 shrink-0 items-center justify-center rounded-pill border text-small font-medium',
                'transition-colors duration-(--dur-state) ease-state',
                active && 'border-ink bg-ink text-paper',
                done && 'border-ink bg-midnight-lo text-ink',
                !active && !done && 'border-pewter-strong bg-surface text-ink-soft',
              )}
            >
              {done ? (
                <svg
                  viewBox="0 0 16 16"
                  className="size-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 8.5 3.5 3.5L13 5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
          );

          return (
            <li
              key={step.id}
              className={cn('flex items-center gap-0.5', i < total - 1 && 'flex-1')}
              aria-current={active ? 'step' : undefined}
            >
              {reachable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  className="tap-target flex items-center gap-1 rounded-pill"
                >
                  {marker}
                  <span className="sr-only">Go back to step {i + 1}: {step.label}</span>
                  <span aria-hidden="true" className="hidden text-small text-ink md:inline">
                    {step.label}
                  </span>
                </button>
              ) : (
                <span className="flex items-center gap-1">
                  {marker}
                  <span
                    className={cn(
                      'hidden text-small md:inline',
                      active ? 'font-medium text-ink' : 'text-ink-soft',
                    )}
                  >
                    {step.label}
                  </span>
                </span>
              )}

              {i < total - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn('h-px flex-1', done ? 'bg-ink' : 'bg-line')}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-1 text-small text-ink-soft md:hidden">
        Step {safeCurrent + 1} of {total}
        {currentStep ? `: ${currentStep.label}` : null}
      </p>
    </nav>
  );
}
