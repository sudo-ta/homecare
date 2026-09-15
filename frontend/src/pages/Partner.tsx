import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import type { UploadedFile } from '@shared/ui/index.js';
import {
  Alert,
  Button,
  Checkbox,
  FileUpload,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from '@shared/ui/index.js';
import { PhoneVerify } from '@/components/PhoneVerify.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { submitProfessionalApplication } from '@/lib/api.js';
import { track } from '@/lib/analytics.js';
import { useSubmit } from '@/lib/useApi.js';
import { useDraft } from '@/lib/useDraft.js';

const DRAFT_KEY = 'partner-draft-v1';

const LANGUAGES = ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi', 'Urdu'];
const AREAS = [
  'Navrangpura',
  'Ellisbridge',
  'Paldi',
  'Maninagar',
  'Satellite',
  'Vastrapur',
  'Bopal',
  'Thaltej',
  'Naranpura',
  'Ghatlodia',
  'Chandkheda',
  'Gota',
  'Naroda',
  'Raopura',
  'Alkapuri',
  'Gotri',
  'Manjalpur',
];
const CATEGORIES = [
  'Nursing',
  'Caregiving',
  'Physiotherapy',
  'Doctor visits',
  'Diagnostics',
  'Equipment',
];

interface Draft {
  applicantType: 'individual' | 'institution';
  phone: string;
  email: string;
  city: string;
  areas: string[];
  termsAccepted: boolean;
  // individual
  fullName: string;
  role: string;
  experienceYears: string;
  qualification: string;
  registrationNumber: string;
  languages: string[];
  availabilityPattern: string;
  expectedRate: string;
  // institution
  organisationName: string;
  institutionType: string;
  contactPersonName: string;
  designation: string;
  address: string;
  serviceCategories: string[];
  teamSize: string;
}

const EMPTY: Draft = {
  applicantType: 'individual',
  phone: '',
  email: '',
  city: '',
  areas: [],
  termsAccepted: false,
  fullName: '',
  role: '',
  experienceYears: '',
  qualification: '',
  registrationNumber: '',
  languages: [],
  availabilityPattern: '',
  expectedRate: '',
  organisationName: '',
  institutionType: '',
  contactPersonName: '',
  designation: '',
  address: '',
  serviceCategories: [],
  teamSize: '',
};

type Docs = Record<string, UploadedFile[]>;

export default function Partner() {
  const navigate = useNavigate();
  const [draft, update] = useDraft<Draft>(DRAFT_KEY, EMPTY);
  const [docs, setDocs] = useState<Docs>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const { submit, submitting, error: submitError } = useSubmit(submitProfessionalApplication);

  const isIndividual = draft.applicantType === 'individual';
  const needsCouncil = isIndividual && ['nurse', 'doctor'].includes(draft.role);

  const setDoc = (name: string) => (files: UploadedFile[]) =>
    setDocs((prev) => ({ ...prev, [name]: files }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    const req = (v: string, key: string, msg: string) => {
      if (!v?.trim()) e[key] = msg;
    };

    if (!/^[6-9]\d{9}$/.test(draft.phone))
      e.phone = 'An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(draft.email))
      e.email = 'That does not look like an email address we could reply to.';
    req(draft.city, 'city', 'Tell us which city you work in.');
    if (draft.areas.length === 0) e.areas = 'Pick at least one area you can work in.';

    if (isIndividual) {
      req(draft.fullName, 'fullName', 'We need your name as it appears on your ID.');
      req(draft.role, 'role', 'Pick the role you are applying for.');
      req(draft.experienceYears, 'experienceYears', 'Enter your years of experience.');
      req(draft.qualification, 'qualification', 'Tell us your qualification.');
      if (draft.languages.length === 0)
        e.languages = 'Tell us at least one language you speak with patients.';
      req(draft.availabilityPattern, 'availabilityPattern', 'Tell us when you can work.');
      if (needsCouncil && !draft.registrationNumber.trim())
        e.registrationNumber = 'Nurses and doctors must give a council registration number.';
      if ((docs.governmentId ?? []).length === 0)
        e.governmentId = 'A government photo ID is required.';
      if ((docs.qualificationCertificate ?? []).length === 0)
        e.qualificationCertificate = 'Your qualification certificate is required.';
      if ((docs.photograph ?? []).length === 0)
        e.photograph = 'A recent photograph is required - families see it before you are assigned.';
      if (needsCouncil && (docs.councilRegistration ?? []).length === 0)
        e.councilRegistration = 'Upload your council registration certificate.';
    } else {
      req(draft.organisationName, 'organisationName', 'We need the organisation name.');
      req(draft.institutionType, 'institutionType', 'Pick what kind of organisation this is.');
      req(draft.contactPersonName, 'contactPersonName', 'We need a contact person.');
      req(draft.designation, 'designation', 'Tell us their designation.');
      req(draft.address, 'address', 'We need the organisation address.');
      req(draft.teamSize, 'teamSize', 'Roughly how many people are on the team?');
      if (draft.serviceCategories.length === 0)
        e.serviceCategories = 'Pick at least one category you offer.';
      if ((docs.registrationCertificate ?? []).length === 0)
        e.registrationCertificate = 'The registration certificate is required.';
      if ((docs.authorisedSignatoryId ?? []).length === 0)
        e.authorisedSignatoryId = 'A photo ID for the authorised signatory is required.';
    }

    if (!draft.termsAccepted)
      e.termsAccepted = 'Please accept the terms and the privacy policy to continue.';
    if (!otpToken) e.otp = 'Confirm your phone number above before submitting.';

    setErrors(e);
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
    }
    return Object.keys(e).length === 0;
  }

  const refs = (name: string) =>
    (docs[name] ?? [])
      .filter((d) => d.status === 'done')
      .map((d) => ({
        key: d.key ?? '',
        fileName: d.file.name,
        sizeBytes: d.file.size,
        contentType: d.file.type,
      }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const common = {
      applicantType: draft.applicantType,
      phone: `+91${draft.phone}`,
      email: draft.email,
      city: draft.city,
      areas: draft.areas,
      termsConsent: { accepted: true, textVersion: brand.legal.consentTextVersion },
      phoneVerificationToken: otpToken ?? undefined,
    };

    const payload = isIndividual
      ? {
          ...common,
          fullName: draft.fullName,
          role: draft.role,
          experienceYears: Number(draft.experienceYears),
          qualification: draft.qualification,
          registrationNumber: draft.registrationNumber || undefined,
          languages: draft.languages,
          availabilityPattern: draft.availabilityPattern,
          expectedRate: draft.expectedRate || undefined,
          governmentId: refs('governmentId'),
          qualificationCertificate: refs('qualificationCertificate'),
          councilRegistration: refs('councilRegistration'),
          experienceLetters: refs('experienceLetters'),
          photograph: refs('photograph'),
          policeVerification: refs('policeVerification'),
        }
      : {
          ...common,
          organisationName: draft.organisationName,
          institutionType: draft.institutionType,
          contactPersonName: draft.contactPersonName,
          designation: draft.designation,
          address: draft.address,
          serviceCategories: draft.serviceCategories,
          teamSize: Number(draft.teamSize),
          registrationCertificate: refs('registrationCertificate'),
          clinicalEstablishmentLicence: refs('clinicalEstablishmentLicence'),
          gstCertificate: refs('gstCertificate'),
          authorisedSignatoryId: refs('authorisedSignatoryId'),
        };

    const result = await submit(payload);
    if (result) {
      track('application_submitted', {
        applicantType: draft.applicantType,
        reference: result.reference,
      });
      sessionStorage.removeItem(DRAFT_KEY);
      navigate('/partner/confirmation', {
        state: {
          reference: result.reference,
          persisted: result.persisted,
          applicantType: draft.applicantType,
          policeVerificationMissing:
            isIndividual && (docs.policeVerification ?? []).length === 0,
        },
        replace: true,
      });
    }
  }

  return (
    <>
      <Seo
        title={`Join the care network - ${brand.name}`}
        description="Apply as a nurse, caregiver, physiotherapist or doctor, or as a hospital, lab or equipment partner. Documents verified in two to three working days."
        path="/partner"
        structuredData={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Join the network', path: '/partner' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <div className="mx-auto w-full max-w-[42rem]">
          <SectionHeading
            as="h2"
            title={<span className="text-h1">Join the care network</span>}
            intro="We place qualified people into home care work across Ahmedabad and Vadodara. Every application is read by a person, and every document is checked before anyone is placed with a patient."
          />

          <form onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-2">
            {submitError ? (
              <Alert tone="critical" title="We could not send that" live>
                <p>
                  {submitError.message} Your answers are still here. Try again, or call{' '}
                  <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
                    {brand.contact.phoneDisplay}
                  </a>
                  .
                </p>
              </Alert>
            ) : null}

            <RadioGroup
              label="Who is applying"
              name="applicantType"
              columns={2}
              value={draft.applicantType}
              onChange={(v) => update({ applicantType: v as Draft['applicantType'] })}
              options={[
                {
                  value: 'individual',
                  label: 'An individual professional',
                  description: 'Nurse, caregiver, physiotherapist or doctor.',
                },
                {
                  value: 'institution',
                  label: 'An organisation',
                  description: 'Hospital, nursing home, lab, equipment provider or agency.',
                },
              ]}
            />

            {isIndividual ? (
              <>
                <Input
                  label="Your full name"
                  value={draft.fullName}
                  onChange={(e) => update({ fullName: e.target.value })}
                  error={errors.fullName}
                  autoComplete="name"
                  required
                  hint="As it appears on your government ID."
                />
                <Select
                  label="Role"
                  options={[
                    { value: 'nurse', label: 'Nurse (GNM, ANM or BSc)' },
                    { value: 'caregiver', label: 'Caregiver or attendant' },
                    { value: 'physiotherapist', label: 'Physiotherapist' },
                    { value: 'doctor', label: 'Doctor' },
                  ]}
                  placeholder="Pick your role"
                  value={draft.role}
                  onChange={(e) => update({ role: e.target.value })}
                  error={errors.role}
                  required
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Years of experience"
                    inputMode="numeric"
                    maxLength={2}
                    value={draft.experienceYears}
                    onChange={(e) => update({ experienceYears: e.target.value.replace(/\D/g, '') })}
                    error={errors.experienceYears}
                    required
                  />
                  <Input
                    label="Expected rate"
                    optionalHint
                    value={draft.expectedRate}
                    onChange={(e) => update({ expectedRate: e.target.value })}
                    placeholder="1200 per 12-hour shift"
                  />
                </div>
                <Input
                  label="Qualification"
                  value={draft.qualification}
                  onChange={(e) => update({ qualification: e.target.value })}
                  error={errors.qualification}
                  placeholder="GNM, Gujarat Nursing Council"
                  required
                />
                <Input
                  label="Council registration number"
                  value={draft.registrationNumber}
                  onChange={(e) => update({ registrationNumber: e.target.value })}
                  error={errors.registrationNumber}
                  required={needsCouncil}
                  optionalHint={!needsCouncil}
                  hint={
                    needsCouncil
                      ? 'Required for nurses and doctors. We check it against the state register.'
                      : 'If you have one.'
                  }
                />
                <Select
                  label="When can you work"
                  options={[
                    { value: 'full-time', label: 'Full time' },
                    { value: 'day-shifts', label: 'Day shifts only' },
                    { value: 'night-shifts', label: 'Night shifts only' },
                    { value: 'visits-only', label: 'Visits only, paid per visit' },
                    { value: 'weekends-only', label: 'Weekends only' },
                  ]}
                  placeholder="Pick the closest"
                  value={draft.availabilityPattern}
                  onChange={(e) => update({ availabilityPattern: e.target.value })}
                  error={errors.availabilityPattern}
                  required
                />
                <ChipGroup
                  label="Languages you speak with patients"
                  options={LANGUAGES}
                  selected={draft.languages}
                  onChange={(languages) => update({ languages })}
                  error={errors.languages}
                  required
                />
              </>
            ) : (
              <>
                <Input
                  label="Organisation name"
                  value={draft.organisationName}
                  onChange={(e) => update({ organisationName: e.target.value })}
                  error={errors.organisationName}
                  required
                />
                <Select
                  label="What kind of organisation"
                  options={[
                    { value: 'hospital', label: 'Hospital' },
                    { value: 'nursing-home', label: 'Nursing home' },
                    { value: 'diagnostic-lab', label: 'Diagnostic laboratory' },
                    { value: 'equipment-provider', label: 'Equipment provider' },
                    { value: 'agency', label: 'Staffing agency' },
                  ]}
                  placeholder="Pick one"
                  value={draft.institutionType}
                  onChange={(e) => update({ institutionType: e.target.value })}
                  error={errors.institutionType}
                  required
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Contact person"
                    value={draft.contactPersonName}
                    onChange={(e) => update({ contactPersonName: e.target.value })}
                    error={errors.contactPersonName}
                    required
                  />
                  <Input
                    label="Designation"
                    value={draft.designation}
                    onChange={(e) => update({ designation: e.target.value })}
                    error={errors.designation}
                    required
                  />
                </div>
                <Textarea
                  label="Organisation address"
                  rows={3}
                  value={draft.address}
                  onChange={(e) => update({ address: e.target.value })}
                  error={errors.address}
                  required
                />
                <Input
                  label="Team size"
                  inputMode="numeric"
                  value={draft.teamSize}
                  onChange={(e) => update({ teamSize: e.target.value.replace(/\D/g, '') })}
                  error={errors.teamSize}
                  required
                />
                <ChipGroup
                  label="Service categories you offer"
                  options={CATEGORIES}
                  selected={draft.serviceCategories}
                  onChange={(serviceCategories) => update({ serviceCategories })}
                  error={errors.serviceCategories}
                  required
                />
              </>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                label="City"
                value={draft.city}
                onChange={(e) => update({ city: e.target.value })}
                error={errors.city}
                placeholder="Ahmedabad"
                required
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(e) => update({ email: e.target.value })}
                error={errors.email}
                required
              />
            </div>

            <ChipGroup
              label="Areas you can work in"
              options={AREAS}
              selected={draft.areas}
              onChange={(areas) => update({ areas })}
              error={errors.areas}
              required
            />

            <Input
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              prefix="+91"
              autoComplete="tel-national"
              value={draft.phone}
              onChange={(e) => {
                update({ phone: e.target.value.replace(/\D/g, '') });
                setOtpToken(null);
              }}
              error={errors.phone}
              required
            />

            <PhoneVerify
              phone={draft.phone}
              purpose="application"
              verified={Boolean(otpToken)}
              onVerified={setOtpToken}
            />
            {errors.otp ? <p className="text-small text-critical">{errors.otp}</p> : null}

            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-2">
              <h2 className="text-h3">Documents</h2>
              <p className="measure text-body text-ink-soft">
                Photographs taken on your phone are fine. PDF, JPG, PNG and HEIC all work, up to
                10 MB each. Large photos are compressed here before uploading, so a slow connection
                is not a problem.
              </p>

              {isIndividual ? (
                <>
                  <FileUpload
                    label="Government photo ID"
                    required
                    value={docs.governmentId ?? []}
                    onChange={setDoc('governmentId')}
                    error={errors.governmentId}
                    hint="Aadhaar, PAN, driving licence or passport."
                  />
                  <FileUpload
                    label="Qualification certificate"
                    required
                    multiple
                    maxFiles={3}
                    value={docs.qualificationCertificate ?? []}
                    onChange={setDoc('qualificationCertificate')}
                    error={errors.qualificationCertificate}
                  />
                  <FileUpload
                    label="Council registration certificate"
                    required={needsCouncil}
                    optionalHint={!needsCouncil}
                    multiple
                    maxFiles={3}
                    value={docs.councilRegistration ?? []}
                    onChange={setDoc('councilRegistration')}
                    error={errors.councilRegistration}
                    hint={needsCouncil ? 'Required for nurses and doctors.' : undefined}
                  />
                  <FileUpload
                    label="Recent photograph"
                    required
                    value={docs.photograph ?? []}
                    onChange={setDoc('photograph')}
                    error={errors.photograph}
                    hint="Families see this before you are assigned. A clear head-and-shoulders photo is enough."
                  />
                  <FileUpload
                    label="Experience letters"
                    optionalHint
                    multiple
                    maxFiles={5}
                    value={docs.experienceLetters ?? []}
                    onChange={setDoc('experienceLetters')}
                  />
                  <FileUpload
                    label="Police verification"
                    optionalHint
                    multiple
                    maxFiles={2}
                    value={docs.policeVerification ?? []}
                    onChange={setDoc('policeVerification')}
                    hint="If you do not have one yet, apply anyway. We will tell you how to get it, and we flag the file until it arrives."
                  />
                </>
              ) : (
                <>
                  <FileUpload
                    label="Registration certificate"
                    required
                    multiple
                    maxFiles={3}
                    value={docs.registrationCertificate ?? []}
                    onChange={setDoc('registrationCertificate')}
                    error={errors.registrationCertificate}
                  />
                  <FileUpload
                    label="Clinical establishment licence"
                    optionalHint
                    multiple
                    maxFiles={3}
                    value={docs.clinicalEstablishmentLicence ?? []}
                    onChange={setDoc('clinicalEstablishmentLicence')}
                    hint="Where it applies to your kind of establishment."
                  />
                  <FileUpload
                    label="GST certificate"
                    optionalHint
                    maxFiles={2}
                    value={docs.gstCertificate ?? []}
                    onChange={setDoc('gstCertificate')}
                  />
                  <FileUpload
                    label="Authorised signatory photo ID"
                    required
                    maxFiles={2}
                    value={docs.authorisedSignatoryId ?? []}
                    onChange={setDoc('authorisedSignatoryId')}
                    error={errors.authorisedSignatoryId}
                  />
                </>
              )}
            </div>

            <Checkbox
              label={
                <>
                  I accept the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="font-medium text-ink underline underline-offset-2"
                  >
                    terms of service
                  </Link>{' '}
                  and the{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    className="font-medium text-ink underline underline-offset-2"
                  >
                    privacy policy
                  </Link>
                  , and confirm the documents I have uploaded are mine and genuine.
                </>
              }
              checked={draft.termsAccepted}
              onChange={(e) => update({ termsAccepted: e.target.checked })}
              error={errors.termsAccepted}
              required
            />

            <Button type="submit" size="lg" loading={submitting} loadingLabel="Sending your application">
              Submit application
            </Button>

            <p className="text-small text-ink-soft">
              Questions before applying? Call{' '}
              <a
                href={telHref()}
                data-analytics="partner-form-call"
                className="font-medium text-ink underline underline-offset-2"
              >
                {brand.contact.phoneDisplay}
              </a>
              . Your answers stay here if you leave and come back in this tab.
            </p>
          </form>
        </div>
      </Section>
    </>
  );
}

/** Multi-select as toggle chips. Easier than a multi-select on a phone. */
function ChipGroup({
  label,
  options,
  selected,
  onChange,
  error,
  required,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-small font-medium text-ink">
        {label}
        {required ? (
          <span className="text-critical" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-0.5 rounded-pill border border-pewter-strong bg-surface px-1.5 py-1 text-small has-checked:border-ink has-checked:bg-midnight-lo"
            >
              <input
                type="checkbox"
                className="size-2 brass-ink"
                checked={checked}
                onChange={(e) =>
                  onChange(
                    e.target.checked ? [...selected, option] : selected.filter((v) => v !== option),
                  )
                }
              />
              {option}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-small text-critical">{error}</p> : null}
    </fieldset>
  );
}
