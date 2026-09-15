import { z } from 'zod';
import {
  email,
  longText,
  optionalEmail,
  personName,
  phoneNational,
  shortText,
  termsConsent,
  uploadedFileRef,
} from './common.js';

/**
 * The professional and institution application tracks from spec 6.5.
 *
 * Modelled as a discriminated union on `applicantType`, so the two tracks
 * cannot be mixed: an institution submission carrying a council registration
 * number fails rather than being quietly accepted and confusing the verifier
 * queue later.
 */

export const professionalRole = z.enum(['nurse', 'caregiver', 'physiotherapist', 'doctor']);
export const institutionType = z.enum([
  'hospital',
  'nursing-home',
  'diagnostic-lab',
  'equipment-provider',
  'agency',
]);
export const availabilityPattern = z.enum([
  'full-time',
  'day-shifts',
  'night-shifts',
  'visits-only',
  'weekends-only',
]);

const baseFields = {
  phone: phoneNational,
  email,
  city: shortText('the city you work in', 80),
  /** Localities the applicant is willing to travel to. */
  areas: z
    .array(z.string().trim().min(1).max(80))
    .min(1, { error: 'Pick at least one area you can work in.' })
    .max(30),
  termsConsent,
  /** Issued by /otp/verify. */
  phoneVerificationToken: z.string().min(16).optional(),
};

export const individualApplication = z.object({
  applicantType: z.literal('individual'),
  ...baseFields,
  fullName: personName,
  role: professionalRole,
  experienceYears: z.coerce
    .number({ error: 'Enter your years of experience as a number.' })
    .int()
    .min(0)
    .max(60, { error: 'Check that figure - it is higher than we can record.' }),
  qualification: shortText('your qualification', 200),
  /**
   * Required for nurses and doctors, who must hold a council registration.
   * Enforced by the refine below rather than by the surface, so caregivers and
   * physiotherapists are not blocked by a rule that does not apply to them.
   */
  registrationNumber: z.string().trim().max(80).optional(),
  languages: z
    .array(z.string().trim().min(1).max(40))
    .min(1, { error: 'Tell us at least one language you speak with patients.' })
    .max(10),
  availabilityPattern,
  expectedRate: z.string().trim().max(120).optional(),

  /* Documents. Spec 6.5 sets which are required. */
  governmentId: z
    .array(uploadedFileRef)
    .min(1, { error: 'A government photo ID is required.' })
    .max(2),
  qualificationCertificate: z
    .array(uploadedFileRef)
    .min(1, { error: 'Your qualification certificate is required.' })
    .max(3),
  councilRegistration: z.array(uploadedFileRef).max(3).default([]),
  experienceLetters: z.array(uploadedFileRef).max(5).default([]),
  photograph: z
    .array(uploadedFileRef)
    .min(1, { error: 'A recent photograph is required - families see it before you are assigned.' })
    .max(1),
  policeVerification: z.array(uploadedFileRef).max(2).default([]),
});

export const institutionApplication = z.object({
  applicantType: z.literal('institution'),
  ...baseFields,
  organisationName: shortText('the organisation name', 200),
  institutionType,
  contactPersonName: personName,
  designation: shortText('your designation', 120),
  address: longText('the organisation address', 400),
  serviceCategories: z
    .array(z.string().trim().min(1).max(60))
    .min(1, { error: 'Pick at least one service category you offer.' })
    .max(10),
  teamSize: z.coerce
    .number({ error: 'Enter your team size as a number.' })
    .int()
    .min(1)
    .max(100000),

  registrationCertificate: z
    .array(uploadedFileRef)
    .min(1, { error: 'The registration certificate is required.' })
    .max(3),
  clinicalEstablishmentLicence: z.array(uploadedFileRef).max(3).default([]),
  gstCertificate: z.array(uploadedFileRef).max(2).default([]),
  authorisedSignatoryId: z
    .array(uploadedFileRef)
    .min(1, { error: 'A photo ID for the authorised signatory is required.' })
    .max(2),
});

export const professionalApplication = z
  .discriminatedUnion('applicantType', [individualApplication, institutionApplication])
  .refine(
    (v) =>
      v.applicantType !== 'individual' ||
      !['nurse', 'doctor'].includes(v.role) ||
      (v.councilRegistration.length > 0 && Boolean(v.registrationNumber?.trim())),
    {
      error:
        'Nurses and doctors must give a council registration number and upload the certificate.',
      path: ['registrationNumber'],
    },
  );

export type IndividualApplication = z.infer<typeof individualApplication>;
export type InstitutionApplication = z.infer<typeof institutionApplication>;
export type ProfessionalApplication = z.infer<typeof professionalApplication>;

/** The general careers form, which is a different thing from joining the network. */
export const careerApplication = z.object({
  fullName: personName,
  phone: phoneNational,
  email,
  role: shortText('the role you are applying for', 120),
  about: longText('something about your experience', 1200),
});

export type CareerApplication = z.infer<typeof careerApplication>;

/** Contact form and waitlist capture both land as leads. */
export const leadSubmission = z.object({
  source: z.enum(['contact', 'coverage_waitlist', 'hero_check']),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().min(1),
  email: optionalEmail,
  city: z.string().trim().max(80).optional(),
  pincode: z.string().trim().max(10).optional(),
  subject: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
});

export type LeadSubmission = z.infer<typeof leadSubmission>;

/* -------------------------------------------------------------------------
 * OTP (spec 7.5)
 * ---------------------------------------------------------------------- */

export const otpSendRequest = z.object({
  phone: phoneNational,
  purpose: z.enum(['booking', 'application']),
});

export const otpVerifyRequest = z.object({
  phone: phoneNational,
  purpose: z.enum(['booking', 'application']),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: 'The code is six digits.' }),
});

export type OtpSendRequest = z.infer<typeof otpSendRequest>;
export type OtpVerifyRequest = z.infer<typeof otpVerifyRequest>;
