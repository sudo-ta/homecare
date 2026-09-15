import type { FormEvent } from 'react';
import { useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { Alert, Button, Input, buttonClasses } from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import type { CoverageResult } from '@shared/types/index.js';
import { ApiError, checkCoverage, submitLead } from '@/lib/api.js';
import { track } from '@/lib/analytics.js';

const PINCODE = /^[1-9][0-9]{5}$/;

export interface PincodeCheckProps {
  /** Where the result came from, for lead attribution. */
  source: 'hero_check' | 'coverage_waitlist';
  /**
   * 'sky' is the hero treatment over the gradient: a glass pill holding a bare
   * input and the check button, with the answer arriving as a white card
   * beneath it. 'inline' is the ordinary labelled-form treatment used
   * everywhere else on the site.
   */
  variant?: 'sky' | 'inline';
  className?: string;
}

/**
 * The serviceability check, and the one memorable piece of motion in the
 * product.
 *
 * It sits on a user action rather than on scroll on purpose: the emotional beat
 * of this product is the instant a worried person at 11pm learns that help
 * reaches their street. That moment is worth the whole motion budget, and
 * nothing else on the site gets any of it.
 *
 * THE SEQUENCE, roughly 1.2s end to end
 *
 *   0ms    the button enters its loading state, same width, no layout shift
 *   220ms  the input row collapses upward and gets out of the way
 *   260ms  the result panel wipes in from its top edge - not a fade, not a slide
 *   340ms  the confirmation line rises from behind a mask
 *   420ms  the available services enter, staggered 80ms apart
 *   last   the call to action arrives, deliberately after a beat
 *
 * It should feel like a held breath releasing, not like a loading screen.
 *
 * On a pincode we do not cover, the same structure runs with none of the
 * flourish: no shake, no red flash, no slow apologetic fade. Disappointment
 * delivered quickly is kinder than disappointment delivered theatrically.
 *
 * THE RULES THIS HONOURS
 *
 * - The result is reachable without the animation. The markup renders in its
 *   final state and the motion is layered on top, so a failed JS load still
 *   shows the answer.
 * - Checking the same pincode twice does not replay the sequence. The panel is
 *   keyed on the value that produced it, so only a genuinely new result
 *   remounts.
 * - Under prefers-reduced-motion it becomes an instant state swap. The wipe and
 *   the masks are opted out explicitly in theme.css, because a clip-path does
 *   not degrade gracefully from a duration change - it snaps.
 */
export function PincodeCheck({ source, variant = 'inline', className }: PincodeCheckProps) {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<CoverageResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labelId = useId();

  /** The value the visible panel came from, used as its React key. */
  const [resultKey, setResultKey] = useState('');
  const lastChecked = useRef('');

  function reset() {
    setResult(null);
    setPincode('');
    lastChecked.current = '';
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = pincode.trim();

    if (!PINCODE.test(value)) {
      setError('A pincode is six digits, like 380009.');
      setResult(null);
      return;
    }

    // Re-checking the value already on screen updates in place rather than
    // replaying the sequence.
    if (value === lastChecked.current && result) return;

    setError(null);
    setChecking(true);
    try {
      const res = await checkCoverage(value);
      setResult(res.data);
      setResultKey(value);
      lastChecked.current = value;
      track('pincode_check', {
        pincode: value,
        covered: res.data?.covered ?? false,
        city: res.data?.city ?? null,
        source,
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'We could not check that just now. Try again, or call us.',
      );
    } finally {
      setChecking(false);
    }
  }

  const answered = result !== null;

  return (
    <div className={className}>
      {/* The input row collapses upward once there is an answer. It does not
          fade in place - it gets out of the way so the panel has the space.
          Over the gradient it stays put instead: the pill is the hero's centre
          of gravity and removing it leaves a hole. */}
      {variant === 'sky' ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={labelId} className="text-small font-medium text-surface">
            Check whether we cover your area
          </label>

          {/* The glass pill. A translucent fill over a blur, holding a solid
              white field - the contrast between the two is what makes it read
              as a control rather than as decoration. */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex flex-wrap items-center gap-1 rounded-pill border border-[rgba(255,255,255,.42)] bg-[rgba(255,255,255,.2)] p-1 backdrop-blur-[10px]"
          >
            <input
              id={labelId}
              name="pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="Pincode, six digits"
              value={pincode}
              aria-invalid={error ? true : undefined}
              aria-describedby="pincode-answer"
              onChange={(e) => {
                setPincode(e.target.value.replace(/D/g, ''));
                if (error) setError(null);
              }}
              className="h-6 min-w-0 flex-1 basis-[190px] rounded-pill border border-transparent bg-surface px-2.5 text-body text-ink placeholder:text-ink-soft"
            />
            <Button type="submit" size="md" loading={checking} loadingLabel="Checking your area">
              Check my area
            </Button>
          </form>

          {error ? (
            <p className="text-center text-small text-[#ffd9d4]">{error}</p>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity] duration-(--dur-state) ease-state',
            answered ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
          )}
          inert={answered}
        >
          <div className="overflow-hidden">
            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end">
                <Input
                  label="Your pincode"
                  id={labelId}
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  placeholder="380009"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/D/g, ''));
                    if (error) setError(null);
                  }}
                  error={error ?? undefined}
                  fieldClassName="flex-1"
                />
                <Button
                  type="submit"
                  size="md"
                  loading={checking}
                  loadingLabel="Checking your area"
                  className={cn('shrink-0', error && 'sm:mb-4')}
                >
                  Check availability
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="pincode-answer" aria-live="polite" className={cn(variant === 'sky' && 'mt-1.5')}>
        {result ? (
          <div key={resultKey} data-motion="wipe">
            {result.covered ? (
              <Covered result={result} onChange={reset} />
            ) : (
              <NotCovered result={result} source={source} onChange={reset} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** A way back to the surface without a page change. */
function CheckAnother({ onChange }: { onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="self-start text-meta text-ink-soft underline underline-offset-2 transition-colors duration-(--dur-hover) ease-state hover:text-ink"
    >
      Check a different pincode
    </button>
  );
}

/** The sequence starts its rows here, and everything must land by 1200ms. */
const ROWS_START_MS = 420;
const SEQUENCE_END_MS = 1200;
const ROW_DURATION_MS = 500;

/**
 * Per-row stagger.
 *
 * The brief asks for 80ms between rows and a total sequence under 1.2 seconds.
 * Those two disagree as soon as a pincode has many services: a covered central
 * pincode carries all eight, and 80ms apiece would put the last row's arrival at
 * about 1.56s, well past the budget and long enough to feel like a loading
 * screen rather than a held breath releasing.
 *
 * So 80ms is the maximum, not a constant. With four services or fewer the
 * stagger is exactly the 80ms specified; beyond that it compresses to fit,
 * because the total is the constraint that actually protects the feel.
 */
function rowStagger(count: number): number {
  if (count <= 1) return 0;
  const budget = SEQUENCE_END_MS - ROW_DURATION_MS - ROWS_START_MS;
  return Math.min(80, Math.floor(budget / (count - 1)));
}

function Covered({ result, onChange }: { result: CoverageResult; onChange: () => void }) {
  const step = rowStagger(result.services.length);
  // The call to action lands just after the last service row, so the sequence
  // resolves on the thing we want tapped.
  const ctaDelay = ROWS_START_MS + result.services.length * step;

  return (
    <Alert
      tone="positive"
      action={
        <div className="flex flex-col gap-1.5">
          <div
            data-motion="row"
            className="flex flex-wrap gap-1"
            style={{ animationDelay: `${ctaDelay}ms` }}
          >
            <Link to="/book" className={buttonClasses('primary', 'md')}>
              Request care here
            </Link>
            <Link to="/services" className={buttonClasses('secondary', 'md')}>
              Read what each service covers
            </Link>
          </div>
          <CheckAnother onChange={onChange} />
        </div>
      }
    >
      {/* The confirmation line rises from behind a mask. */}
      <span data-motion="mask">
        <span className="text-body font-semibold text-ink" style={{ animationDelay: '340ms' }}>
          We cover {result.locality}, {result.city}.
        </span>
      </span>

      <p
        data-motion="row"
        className="mt-1 text-meta text-ink-soft"
        style={{ animationDelay: '400ms' }}
      >
        {result.services.length} service{result.services.length === 1 ? '' : 's'} available at{' '}
        {result.pincode}
      </p>

      <ul className="mt-1 flex flex-col gap-0.5">
        {result.services.map((s, i) => (
          <li key={s.slug} data-motion="row" style={{ animationDelay: `${ROWS_START_MS + i * step}ms` }}>
            <Link
              to={`/services/${s.slug}`}
              className="text-body text-ink underline underline-offset-2 transition-colors duration-(--dur-hover) ease-state hover:text-ink"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </Alert>
  );
}

function NotCovered({
  result,
  source,
  onChange,
}: {
  result: CoverageResult;
  source: PincodeCheckProps['source'];
  onChange: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function join(e: FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErr('An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.');
      return;
    }
    setErr(null);
    setSaving(true);
    try {
      await submitLead({ source, pincode: result.pincode, phone: `+91${phone}` });
      track('waitlist_join', { pincode: result.pincode, source });
      setSaved(true);
    } catch {
      setErr('We could not save that. Try again, or call us instead.');
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <Alert tone="positive" title="We have your number">
        <p>
          We will call you when {result.pincode} is covered. If you need care before then, call{' '}
          <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
            {brand.contact.phoneDisplay}
          </a>{' '}
          and we will see what we can arrange.
        </p>
      </Alert>
    );
  }

  // No flourish here on purpose: one masked line and the waitlist surface, at the
  // same speed as the good news. No stagger, no ceremony.
  return (
    <Alert tone="attention">
      <span data-motion="mask">
        <span className="text-body font-semibold text-ink">
          We do not cover {result.pincode} yet.
        </span>
      </span>

      <p className="mt-1">
        Leave a number and we will tell you when we do. If it is urgent, call{' '}
        <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
          {brand.contact.phoneDisplay}
        </a>{' '}
        and we will see what we can arrange.
      </p>

      {result.nearbyCovered && result.nearbyCovered.length > 0 ? (
        <p className="mt-1 text-meta text-ink-soft">
          The nearest areas we do cover are{' '}
          {result.nearbyCovered.map((n, i) => (
            <span key={n.pincode}>
              {n.locality} ({n.pincode})
              {i < (result.nearbyCovered?.length ?? 0) - 1 ? ', ' : ''}
            </span>
          ))}
          .
        </p>
      ) : null}

      <form onSubmit={join} className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end" noValidate>
        <Input
          label="Your mobile number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          prefix="+91"
          placeholder="9876543210"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, ''));
            if (err) setErr(null);
          }}
          error={err ?? undefined}
          fieldClassName="flex-1"
        />
        <Button type="submit" variant="secondary" loading={saving} loadingLabel="Saving your number">
          Tell me when you cover this area
        </Button>
      </form>

      <div className="mt-1.5 flex">
        <CheckAnother onChange={onChange} />
      </div>
    </Alert>
  );
}
