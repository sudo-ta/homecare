import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Service } from '@shared/types/index.js';
import { cn } from '@shared/utils/index.js';
import { money, priceUnitLabel } from '@/lib/format.js';
import { estimate, isShiftPriced } from '@/lib/pricing.js';

/**
 * The price estimator.
 *
 * Spec 6.2 is that starting prices are published. This goes a step past a
 * table: it lets someone set the two things that actually move a quote and
 * watch the figure change, which is the difference between "prices from X" and
 * knowing roughly what next month costs.
 *
 * It is an estimate and says so, twice. A coordinator confirms the real figure,
 * and nothing here becomes a booking on its own.
 */


export function PriceEstimator({ services }: { services: Service[] }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const [night, setNight] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  /* Two alternating animation channels. Re-triggering the same animation on the
     same element does nothing, because the browser sees no change, so the price
     swaps between price-a and price-b to restart it on every recalculation. */
  const [tick, setTick] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const service = services[index];

  const commit = useCallback((i: number) => {
    setIndex(i);
    setActiveIndex(i);
    setOpen(false);
    setTick((t) => t + 1);
  }, []);

  const recalc = useCallback((fn: () => void) => {
    fn();
    setTick((t) => t + 1);
  }, []);

  // A listbox left open behind a click elsewhere is a stuck overlay.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  if (!service) return null;

  const shifted = isShiftPriced(service);
  const price = estimate(service, full, night);
  const unit = shifted
    ? full
      ? 'per 24-hour day'
      : 'per 12-hour shift'
    : priceUnitLabel(service.priceUnit);

  /**
   * Focus never leaves the trigger. The active option is tracked with
   * aria-activedescendant instead, so the arrow keys work without moving focus
   * into the list and losing it the moment the list closes.
   */
  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const last = services.length - 1;

    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveIndex(index);
        setOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(last, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(last);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.75 rounded-[28px] border border-line bg-paper p-[clamp(1.25rem,3vw,1.875rem)] shadow-[0_26px_60px_-36px_rgba(16,20,31,.3)]">
      {/* --- which service ------------------------------------------------- */}
      <div className="flex flex-col gap-1">
        <span id="svc-label" className="text-small font-medium text-ink">
          Which service
        </span>

        <div ref={wrapRef} className="relative">
          <button
            type="button"
            id="svc-trigger"
            onClick={() => {
              if (open) {
                setOpen(false);
              } else {
                setActiveIndex(index);
                setOpen(true);
              }
            }}
            onKeyDown={onTriggerKey}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-labelledby="svc-label svc-trigger"
            aria-activedescendant={open ? `svc-opt-${activeIndex}` : undefined}
            className={cn(
              'flex h-6.5 w-full cursor-pointer items-center justify-between gap-1.25 rounded-panel',
              'bg-surface px-1.75 text-left text-body text-ink border',
              'transition-[border-color,box-shadow] duration-(--dur-state) ease-state',
              open ? 'border-accent shadow-[0_0_0_3px_rgba(48,86,167,.16)]' : 'border-line',
            )}
          >
            <span className="min-w-0 truncate">{service.name}</span>
            <svg
              viewBox="0 0 24 24"
              className="size-[17px] shrink-0 transition-[rotate] duration-(--dur-state) ease-signature"
              style={{ rotate: open ? '180deg' : '0deg' }}
              fill="none"
              stroke="var(--color-pewter-text)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {open ? (
            <ul
              role="listbox"
              aria-labelledby="svc-label"
              tabIndex={-1}
              className="absolute inset-x-0 top-[calc(100%+6px)] z-[5] max-h-36 overflow-y-auto rounded-panel border border-[rgba(255,255,255,.9)] bg-[rgba(255,255,255,.86)] p-0.75 shadow-[0_26px_60px_-26px_rgba(16,20,31,.5),inset_0_1px_0_rgba(255,255,255,.95)] backdrop-blur-[26px] backdrop-saturate-[190%]"
            >
              {services.map((s, i) => {
                const selected = i === index;
                const active = i === activeIndex;
                return (
                  <li
                    key={s.slug}
                    role="option"
                    id={`svc-opt-${i}`}
                    aria-selected={selected}
                    onClick={() => commit(i)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      'flex min-h-5.5 cursor-pointer items-center justify-between gap-1.25',
                      'rounded-control px-1.5 text-body',
                      active && 'bg-[rgba(48,86,167,.1)]',
                      selected || active ? 'text-ink' : 'text-ink-soft',
                    )}
                  >
                    <span className="min-w-0 truncate">{s.name}</span>
                    {selected ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="size-[15px] shrink-0"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {/* --- shift length --------------------------------------------------- */}
      <div className="flex flex-col gap-1">
        <span className="text-small font-medium text-ink">
          {shifted ? 'How long each day' : 'How long each day (visit-based service)'}
        </span>
        <Segmented
          label="Shift length"
          left="12-hour"
          right="24-hour"
          rightActive={full}
          onLeft={() => recalc(() => setFull(false))}
          onRight={() => recalc(() => setFull(true))}
        />
        {shifted ? null : (
          <p className="text-meta text-pewter-text">
            Charged per visit, so shift length does not change it.
          </p>
        )}
      </div>

      {/* --- cover type ----------------------------------------------------- */}
      <div className="flex flex-col gap-1">
        <span className="text-small font-medium text-ink">When the care is needed</span>
        <Segmented
          label="Cover type"
          left="Weekdays"
          right="Nights and Sundays"
          rightActive={night}
          onLeft={() => recalc(() => setNight(false))}
          onRight={() => recalc(() => setNight(true))}
        />
      </div>

      {/* --- the figure ----------------------------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-line pt-2.5">
        <div className="flex flex-col gap-0.25">
          <span className="text-meta text-pewter-text">Estimate, {unit}</span>
          <span
            key={tick}
            data-motion={tick % 2 === 0 ? 'price-a' : 'price-b'}
            aria-live="polite"
            className="font-display text-h1 tabular-nums text-ink"
          >
            {money(price)}
          </span>
        </div>

        <a
          href="#book"
          className="inline-flex h-7 items-center justify-center gap-1 rounded-pill border border-navy bg-navy px-3.5 text-body font-medium text-surface no-underline shadow-[0_10px_26px_-12px_rgba(0,11,51,.8)] transition-colors duration-(--dur-state) ease-state hover:bg-navy-hover"
        >
          Get this quote confirmed
          <svg
            viewBox="0 0 24 24"
            className="size-[19px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      <p className="text-meta text-pewter-text">
        An estimate. A coordinator confirms the final figure before anything is booked.
      </p>
    </div>
  );
}

/**
 * A two-option segmented control.
 *
 * The moving pill is one absolutely-positioned element sliding between the two
 * halves, rather than a background that appears and disappears on each button.
 * The travel is what says the two options are one choice.
 */
function Segmented({
  label,
  left,
  right,
  rightActive,
  onLeft,
  onRight,
}: {
  label: string;
  left: string;
  right: string;
  rightActive: boolean;
  onLeft: () => void;
  onRight: () => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative grid grid-cols-2 gap-0.5 rounded-pill border border-line bg-pewter-lo p-0.5"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-4px)] rounded-pill bg-navy shadow-[0_2px_8px_rgba(0,11,51,.45)] transition-[translate] duration-(--dur-panel) ease-signature"
        style={{ translate: rightActive ? '100% 0' : '0 0' }}
      />
      <SegmentButton label={left} active={!rightActive} onClick={onLeft} />
      <SegmentButton label={right} active={rightActive} onClick={onRight} />
    </div>
  );
}

function SegmentButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative z-[1] h-6 cursor-pointer rounded-pill border-0 bg-transparent',
        'text-small font-medium transition-colors duration-(--dur-state) ease-state',
        active ? 'text-surface' : 'text-pewter-text',
      )}
    >
      {label}
    </button>
  );
}
