import { z } from 'zod';
import {
  futureDate,
  healthDataConsent,
  optionalEmail,
  personName,
  phoneNational,
  pincode,
  shortText,
  termsConsent,
  uploadedFileRef,
} from './common.js';

/**
 * The four-step booking intake from spec 6.4.
 *
 * Each step has its own schema so the form can validate per step, and the full
 * schema is their intersection so the API validates the whole thing regardless
 * of how the client assembled it. The API never trusts that the client ran the
 * per-step checks.
 */

export const urgency = z.enum(['today', 'within-2-days', 'planning-ahead', 'specific-date']);
export const durationPattern = z.enum([
  'single-visit',
  'hourly',
  'twelve-hour',
  'twenty-four-hour',
  'monthly',
]);
export const mobilityLevel = z.enum(['independent', 'needs-support', 'bed-bound', 'wheelchair']);
export const genderPreference = z.enum(['female', 'male', 'no-preference']);
export const contactPreference = z.enum(['phone', 'whatsapp', 'email']);

/** Step 1: what you need. */
export const bookingStep1 = z.object({
  serviceSlug: shortText('the service you need', 80),
  urgency,
  durationPattern,
});

/** Step 2: who it is for. */
export const bookingStep2 = z.object({
  patientName: personName,
  patientAge: z.coerce
    .number({ error: 'Enter the age in years.' })
    .int()
    .min(0, { error: 'Enter the age in years.' })
    .max(120, { error: 'Check that age - it is higher than we can record.' }),
  patientGender: z.enum(['female', 'male', 'other', 'prefer-not-to-say']),
  conditionNotes: z
    .string()
    .trim()
    .min(1, { error: 'A sentence about the condition is enough to match the right person.' })
    .max(2000),
  mobilityLevel,
  isHospitalDischarge: z.boolean(),
  hospitalName: z.string().trim().max(200).optional(),
  /** Discharge summary or prescription. Optional at intake. */
  documents: z.array(uploadedFileRef).max(5).default([]),
});

/** Step 3: where and when. */
export const bookingStep3 = z.object({
  pincode,
  addressLine: shortText('the address', 300),
  landmark: z.string().trim().max(200).optional(),
  preferredStartDate: futureDate,
  preferredTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: 'Pick a time.' })
    .optional(),
});

/** Step 4: who to contact. */
export const bookingStep4 = z.object({
  bookerName: personName,
  relationshipToPatient: shortText('your relationship to the patient', 80),
  bookerPhone: phoneNational,
  bookerEmail: optionalEmail,
  preferredContact: contactPreference,
  genderPreference,
  languagePreference: z.array(z.string().trim().min(1).max(40)).max(6).default([]),
});

/**
 * The complete submission.
 *
 * The consents and the OTP token are on the whole booking rather than on a
 * step, because they authorise the submission itself. Spec 7.5 calls the OTP
 * the one thing preventing the booking table from filling with junk.
 */
export const bookingSubmission = bookingStep1
  .and(bookingStep2)
  .and(bookingStep3)
  .and(bookingStep4)
  .and(
    z.object({
      healthDataConsent,
      termsConsent,
      /** Issued by /otp/verify. Required by the endpoint, not by the form state. */
      phoneVerificationToken: z.string().min(16).optional(),
      source: z.string().max(60).default('web'),
    }),
  )
  .refine((v) => !v.isHospitalDischarge || Boolean(v.hospitalName?.trim()), {
    error: 'Tell us which hospital, so we can ask them for the discharge summary.',
    path: ['hospitalName'],
  })
  .refine((v) => v.urgency !== 'specific-date' || Boolean(v.preferredStartDate), {
    error: 'Pick the date you need care to start.',
    path: ['preferredStartDate'],
  });

export type BookingStep1 = z.infer<typeof bookingStep1>;
export type BookingStep2 = z.infer<typeof bookingStep2>;
export type BookingStep3 = z.infer<typeof bookingStep3>;
export type BookingStep4 = z.infer<typeof bookingStep4>;
export type BookingSubmission = z.infer<typeof bookingSubmission>;

/** Everything the multi-step form holds, including partially completed steps. */
export type BookingDraft = Partial<
  BookingStep1 & BookingStep2 & BookingStep3 & BookingStep4
> & {
  healthDataConsentAccepted?: boolean;
  termsConsentAccepted?: boolean;
};
