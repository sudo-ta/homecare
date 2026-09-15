import type { Service } from '@shared/types/index.js';
import { money, priceUnitLabel } from '@/lib/format.js';
import { estimate, isShiftPriced } from '@/lib/pricing.js';
import { activeAreas } from '@/content/serviceAreas.js';

/**
 * The summary rail.
 *
 * Four steps is long enough that by the last one someone has forgotten what
 * they picked on the first. This holds the answers where they can be checked
 * without going back, and carries a running estimate so the price is never a
 * surprise at the end.
 *
 * Every slot says what is still missing rather than collapsing, so the rail is
 * the same height throughout and the layout does not jump between steps.
 *
 * The figure is the same arithmetic as the home page estimator, from
 * lib/pricing.ts. It is indicative and says so: nothing here is a quote, and
 * nothing is charged.
 */
export function BookingSummary({
  service,
  urgency,
  pattern,
  patientName,
  patientAge,
  pincode,
  fullDay,
  night,
}: {
  service: Service | undefined;
  urgency: string | undefined;
  pattern: string | undefined;
  patientName: string;
  patientAge: string;
  pincode: string;
  fullDay: boolean;
  night: boolean;
}) {
  const area = pincode ? activeAreas().find((a) => a.pincode === pincode) : undefined;

  const when = [urgency, pattern].filter(Boolean).join(' · ');
  const patient = patientName
    ? patientName + (patientAge ? `, ${patientAge}` : '')
    : 'Name pending';
  const where = area ? `${area.locality} · ${area.pincode}` : pincode || 'Address pending';

  const price = service ? estimate(service, fullDay, night) : null;
  const unit = service
    ? isShiftPriced(service) && fullDay
      ? 'per 24-hour day'
      : priceUnitLabel(service.priceUnit)
    : '';

  return (
    <aside
      aria-label="Your request so far"
      // mt clears the step bars so the rail lines up with the card.
      className="mt-3.25 flex flex-col gap-1.25 rounded-[20px] border border-[rgba(26,65,153,.2)] bg-[rgba(26,65,153,.05)] p-2"
    >
      <span className="font-sans text-meta font-semibold tracking-[.12em] text-blue-deep uppercase">
        Summary
      </span>

      <dl className="flex flex-col gap-[9px] text-small">
        <Row label="Service" value={service?.name ?? 'Not chosen yet'} />
        <Row label="When" value={when || 'Not chosen yet'} />
        <Row label="Patient" value={patient} />
        <Row label="Where" value={where} />
      </dl>

      <div className="flex flex-col gap-0.25 border-t border-[rgba(26,65,153,.18)] pt-1.25">
        <span className="text-meta text-pewter-text">Indicative</span>
        {price === null ? (
          <span className="text-small text-pewter-text">Pick a service to see a figure</span>
        ) : (
          <span className="flex flex-wrap items-baseline gap-[7px]">
            <span className="font-display text-[1.75rem] leading-[1.05] tracking-[-.03em] tabular-nums text-ink">
              {money(price)}
            </span>
            <span className="text-meta text-pewter-text">{unit}</span>
          </span>
        )}
      </div>

      <p className="text-meta leading-[1.45] text-pewter-text">
        A coordinator confirms the final figure on the call. Nothing is charged here.
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-meta text-pewter-text">{label}</dt>
      <dd className="m-0 text-ink">{value}</dd>
    </div>
  );
}
