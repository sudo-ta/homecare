import { z } from 'zod';

/**
 * Shared surface schemas.
 *
 * Spec 3 requires Zod validation on every route, shared between frontend and
 * backend from a common package. These are the leaf rules both sides import, so
 * a rule cannot be tightened in one place and left loose in the other - which
 * is how a form that looks validated ends up accepting junk at the API.
 *
 * Messages are written to the voice in spec 5.7: say what happened and what to
 * do about it, in the second person, without an exclamation mark.
 */

/** Indian mobile: ten digits starting 6-9. Stored E.164, entered as ten digits. */
export const phoneNational = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, {
    error: 'An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.',
  });

export const phoneE164 = z
  .string()
  .trim()
  .regex(/^\+91[6-9]\d{9}$/, { error: 'That phone number is not in the expected format.' });

/** Six digits, not starting with zero. */
export const pincode = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, { error: 'A pincode is six digits, like 380009.' });

export const email = z.email({
  error: 'That does not look like an email address we could reply to.',
});

export const optionalEmail = z.union([z.literal(''), email]).optional();

export const personName = z
  .string()
  .trim()
  .min(2, { error: 'That name looks too short. Use the name as it appears on an ID.' })
  .max(120, { error: 'That name is longer than we can store.' });

export const shortText = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, { error: `We need ${label} to arrange this.` })
    .max(max, { error: `Keep ${label} under ${max} characters.` });

export const longText = (label: string, max = 2000) =>
  z
    .string()
    .trim()
    .min(1, { error: `We need ${label} to arrange this.` })
    .max(max, { error: `Keep ${label} under ${max} characters.` });

/** A date that is today or later, as YYYY-MM-DD in local time. */
export const futureDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'Pick a date.' })
  .refine(
    (v) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const picked = new Date(`${v}T00:00:00`);
      return picked >= today;
    },
    { error: 'That date has already passed. Pick today or a day after it.' },
  );

/**
 * A file that has finished uploading. The client sends the storage key it got
 * back from the pre-signed upload, never the bytes - spec 7.4 keeps files out
 * of the API process entirely.
 */
export const uploadedFileRef = z.object({
  key: z.string().min(1),
  fileName: z.string().min(1).max(255),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024, {
    error: 'That file is over the 10 MB limit.',
  }),
  contentType: z.string().min(1).max(100),
});

export type UploadedFileRef = z.infer<typeof uploadedFileRef>;

/**
 * Consent to process health data.
 *
 * Spec 7.7 requires explicit, separately-worded consent logged with a
 * timestamp, an IP and the exact text version shown. The version travels with
 * the submission so the record says which wording was agreed to, not merely
 * that a box was ticked.
 */
export const healthDataConsent = z.object({
  accepted: z.literal(true, {
    error: 'We cannot arrange care without your agreement to this.',
  }),
  textVersion: z.string().min(1),
});

export const termsConsent = z.object({
  accepted: z.literal(true, {
    error: 'Please accept the terms and the privacy policy to continue.',
  }),
  textVersion: z.string().min(1),
});

/** The short-lived token the OTP verify step issues (spec 7.5). */
export const otpToken = z.string().min(16, {
  error: 'Verify your phone number before submitting.',
});
