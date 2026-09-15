import type { DurationPattern, PriceUnit, ProfessionalRole } from '@shared/types/index.js';

/** Rupees, no decimals, Indian digit grouping. */
const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const money = (amount: number): string => inr.format(amount);

const PRICE_UNITS: Record<PriceUnit, string> = {
  'per-visit': 'per visit',
  'per-hour': 'per hour',
  'per-12-hour-shift': 'per 12-hour shift',
  'per-24-hour': 'per 24 hours',
  'per-month': 'per month',
};

export const priceUnitLabel = (unit: PriceUnit): string => PRICE_UNITS[unit];

const DURATIONS: Record<DurationPattern, string> = {
  'single-visit': 'A single visit',
  hourly: 'By the hour',
  'twelve-hour': '12-hour shift',
  'twenty-four-hour': '24-hour cover',
  monthly: 'Ongoing, monthly',
};

export const durationLabel = (d: DurationPattern): string => DURATIONS[d];

const ROLES: Record<ProfessionalRole, string> = {
  nurse: 'Nurse',
  caregiver: 'Caregiver',
  physiotherapist: 'Physiotherapist',
  doctor: 'Doctor',
  institution: 'Partner organisation',
};

export const roleLabel = (r: ProfessionalRole): string => ROLES[r];

/**
 * Dates render in IST regardless of where the reader's browser thinks it is.
 * Spec 3: stored UTC, rendered IST.
 */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

export const formatDateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

/** "9 years" - experience is always plural-safe and never "1 years". */
export const years = (n: number): string => `${n} year${n === 1 ? '' : 's'}`;

/** Initials for the avatar fallback. Handles Devanagari and Gujanati names too. */
export function initials(name: string): string {
  const parts = name
    .replace(/^(Dr|Mr|Mrs|Ms|Shri|Smt)\.?\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}
