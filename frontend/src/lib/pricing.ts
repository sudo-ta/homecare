import type { Service } from '@shared/types/index.js';

/**
 * Indicative pricing.
 *
 * Shared by the home page estimator and the booking summary rail, so the figure
 * someone sees on the home page is the figure they see while filling the form.
 * Two copies of this arithmetic would drift the first time a multiplier moved.
 *
 * A 24-hour day is 1.86x a 12-hour shift, and night or Sunday cover adds 15%.
 * Neither figure is in the catalogue: `Service` carries one `basePrice` and no
 * multipliers. They belong beside the price in the CMS when Phase 2 builds the
 * pricing model, and this is the one place to change when they do.
 */
export const FULL_DAY_MULTIPLIER = 1.86;
export const NIGHT_MULTIPLIER = 1.15;

/**
 * Shift length only moves the price of a service SOLD by the shift. Derived
 * from the price unit rather than a hand-kept list of service names, so a new
 * shift-priced service behaves correctly the day it enters the catalogue.
 */
export const isShiftPriced = (s: Service): boolean => s.priceUnit === 'per-12-hour-shift';

/**
 * Rounded to the nearest ten rupees. A figure to the rupee would imply a
 * precision nobody has confirmed.
 */
export function estimate(service: Service, fullDay: boolean, night: boolean): number {
  const shift = isShiftPriced(service) && fullDay ? FULL_DAY_MULTIPLIER : 1;
  const cover = night ? NIGHT_MULTIPLIER : 1;
  return Math.round((service.basePrice * shift * cover) / 10) * 10;
}
