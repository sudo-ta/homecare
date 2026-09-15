import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import {
  bookingStep1,
  bookingStep2,
  bookingStep3,
  bookingStep4,
} from '@shared/schemas/index.js';
import type { UploadedFile } from '@shared/ui/index.js';
import { Alert, FileUpload } from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import {
  CheckPill,
  ConsentCheck,
  Disclosure,
  Field,
  OptionGroup,
  OptionPill,
  ServiceOption,
  StepBars,
  fieldClasses,
} from '@/components/BookingControls.js';
import { BookingSummary } from '@/components/BookingSummary.js';
import { PhoneVerify } from '@/components/PhoneVerify.js';
import { Seo } from '@/components/Seo.js';
import { activeAreas } from '@/content/serviceAreas.js';
import { track } from '@/lib/analytics.js';
import { getServices, submitBooking } from '@/lib/api.js';
import { durationLabel } from '@/lib/format.js';
import { useApi, useSubmit } from '@/lib/useApi.js';
import { useDraft } from '@/lib/useDraft.js';

const STEPS = [
  { id: 'need', label: 'What you need' },
  { id: 'patient', label: "Who it's for" },
  { id: 'where', label: 'Where and when' },
  { id: 'contact', label: 'Who to contact' },
];

const DRAFT_KEY = 'booking-draft-v1';

const URGENCY = [
  { value: 'today', label: 'Today' },
  { value: 'within-2-days', label: 'Within two days' },
  { value: 'planning-ahead', label: 'Planning ahead' },
  { value: 'specific-date', label: 'On a specific date' },
];

const PATIENT_GENDER = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const MOBILITY = [
  { value: 'independent', label: 'Walks unaided' },
  { value: 'needs-support', label: 'Needs help walking' },
  { value: 'wheelchair', label: 'Uses a wheelchair' },
  { value: 'bed-bound', label: 'Bed-bound' },
];

/**
 * Four named slots rather than a clock.
 *
 * Nobody arranging a nurse wants to pick 09:47, and a coordinator schedules by
 * half-day anyway. The stored value stays `HH:MM` because that is what
 * `bookingStep3` validates and what the API takes, so this is a change to the
 * control and not to the contract.
 */
const TIME_SLOTS = [
  { value: '09:00', label: 'Morning' },
  { value: '14:00', label: 'Afternoon' },
  { value: '18:00', label: 'Evening' },
  { value: '22:00', label: 'Night' },
];

const NIGHT_SLOT = '22:00';

const REACH = [
  { value: 'phone', label: 'Phone call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
];

const PRO_GENDER = [
  { value: 'no-preference', label: 'No preference' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
];

const LANGUAGES = ['Gujarati', 'Hindi', 'English', 'Marathi', 'Punjabi', 'Urdu'];

interface Draft {
  serviceSlug: string;
  urgency: string;
  durationPattern: string;
  patientName: string;
  patientAge: string;
  patientGender: string;
  conditionNotes: string;
  mobilityLevel: string;
  isHospitalDischarge: string;
  hospitalName: string;
  pincode: string;
  addressLine: string;
  landmark: string;
  preferredStartDate: string;
  preferredTime: string;
  bookerName: string;
  relationshipToPatient: string;
  bookerPhone: string;
  bookerEmail: string;
  preferredContact: string;
  genderPreference: string;
  languagePreference: string[];
  healthConsent: boolean;
  termsAccepted: boolean;
}

const EMPTY: Draft = {
  serviceSlug: '',
  urgency: '',
  durationPattern: '',
  patientName: '',
  patientAge: '',
  patientGender: '',
  conditionNotes: '',
  mobilityLevel: '',
  isHospitalDischarge: 'no',
  hospitalName: '',
  pincode: '',
  addressLine: '',
  landmark: '',
  preferredStartDate: '',
  preferredTime: '',
  bookerName: '',
  relationshipToPatient: '',
  bookerPhone: '',
  bookerEmail: '',
  preferredContact: 'phone',
  genderPreference: 'no-preference',
  languagePreference: [],
  healthConsent: false,
  termsAccepted: false,
};

export default function Book() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { data: services } = useApi(getServices, []);
  const [draft, updateDraft, clearDraft] = useDraft<Draft>(DRAFT_KEY, EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const { submit, submitting, error: submitError } = useSubmit(submitBooking);

  /**
   * Editing a field clears its error. Without this the message stays under a
   * field that has already been corrected, until the next Continue re-runs
   * validation, which reads as the answer still being wrong.
   */
  const update = useCallback(
    (patch: Partial<Draft>) => {
      updateDraft(patch);
      setErrors((prev) => {
        const keys = Object.keys(patch).filter((k) => k in prev);
        if (keys.length === 0) return prev;
        const next = { ...prev };
        for (const key of keys) delete next[key];
        return next;
      });
    },
    [updateDraft],
  );

  // Deep link from a service page: /book?service=home-nursing
  useEffect(() => {
    const preset = params.get('service');
    if (preset && !draft.serviceSlug) update({ serviceSlug: preset });
    // Only on first mount; later edits are the user's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    track('booking_step_view', { step: step + 1, stepName: STEPS[step]?.id ?? '' });
  }, [step]);

  const chosenService = services?.find((s) => s.slug === draft.serviceSlug);

  const durationOptions = useMemo(() => {
    const available = chosenService?.durationOptions ?? [
      'single-visit',
      'hourly',
      'twelve-hour',
      'twenty-four-hour',
      'monthly',
    ];
    return available.map((d) => ({ value: d, label: durationLabel(d) }));
  }, [chosenService]);

  /** Live coverage feedback while the pincode is typed. */
  const coverage = useMemo(() => {
    const pin = draft.pincode;
    if (pin.length === 0) {
      return { tone: 'muted' as const, text: `${activeAreas().length} localities across Ahmedabad and Vadodara.` };
    }
    if (pin.length < 6) return { tone: 'muted' as const, text: 'Six digits.' };
    const hit = activeAreas().find((a) => a.pincode === pin);
    return hit
      ? { tone: 'positive' as const, text: `Covered - ${hit.locality}, ${hit.city}.` }
      : {
          tone: 'attention' as const,
          text: 'Not covered yet. Send the request anyway and a coordinator will tell you who is.',
        };
  }, [draft.pincode]);

  function validateStep(index: number): boolean {
    const next: Record<string, string> = {};

    const collect = (result: {
      success: boolean;
      error?: { issues: { path: PropertyKey[]; message: string }[] };
    }) => {
      if (result.success) return;
      for (const issue of result.error?.issues ?? []) {
        const key = String(issue.path[0] ?? '');
        if (key && !next[key]) next[key] = issue.message;
      }
    };

    if (index === 0) {
      collect(
        bookingStep1.safeParse({
          serviceSlug: draft.serviceSlug,
          urgency: draft.urgency,
          durationPattern: draft.durationPattern,
        }),
      );
      if (!draft.urgency) next.urgency = 'Tell us how soon you need this.';
      if (!draft.durationPattern) next.durationPattern = 'Pick how often care is needed.';
    }

    if (index === 1) {
      collect(
        bookingStep2.safeParse({
          patientName: draft.patientName,
          patientAge: draft.patientAge,
          patientGender: draft.patientGender,
          conditionNotes: draft.conditionNotes,
          mobilityLevel: draft.mobilityLevel,
          isHospitalDischarge: draft.isHospitalDischarge === 'yes',
          hospitalName: draft.hospitalName,
          documents: [],
        }),
      );
      if (!draft.patientGender) next.patientGender = 'Pick one, so we can match a preference later.';
      if (!draft.mobilityLevel) next.mobilityLevel = 'This decides whether one person can manage alone.';
      if (draft.isHospitalDischarge === 'yes' && !draft.hospitalName.trim()) {
        next.hospitalName = 'Tell us which hospital, so we can ask them for the discharge summary.';
      }
    }

    if (index === 2) {
      collect(
        bookingStep3.safeParse({
          pincode: draft.pincode,
          addressLine: draft.addressLine,
          landmark: draft.landmark,
          preferredStartDate: draft.preferredStartDate,
          preferredTime: draft.preferredTime || undefined,
        }),
      );
    }

    if (index === 3) {
      collect(
        bookingStep4.safeParse({
          bookerName: draft.bookerName,
          relationshipToPatient: draft.relationshipToPatient,
          bookerPhone: draft.bookerPhone,
          bookerEmail: draft.bookerEmail || undefined,
          preferredContact: draft.preferredContact,
          genderPreference: draft.genderPreference,
          languagePreference: draft.languagePreference,
        }),
      );
      if (!draft.healthConsent) {
        next.healthConsent = 'We cannot arrange care without your agreement to this.';
      }
      if (!draft.termsAccepted) {
        next.termsAccepted = 'Please accept the terms and the privacy policy to continue.';
      }
      if (!otpToken) {
        next.otp = 'Confirm your phone number above before submitting.';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  /** The shell scrolls, not the document, so the panel is what has to go back to the top. */
  function scrollPanelTop() {
    document.getElementById('main')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goNext() {
    if (!validateStep(step)) {
      // Move focus to the first error so a screen reader lands on it.
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    track('booking_step_complete', { step: step + 1, stepName: STEPS[step]?.id ?? '' });
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollPanelTop();
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollPanelTop();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    if (!validateStep(step)) return;

    const result = await submit({
      serviceSlug: draft.serviceSlug,
      urgency: draft.urgency,
      durationPattern: draft.durationPattern,
      patientName: draft.patientName,
      patientAge: Number(draft.patientAge),
      patientGender: draft.patientGender,
      conditionNotes: draft.conditionNotes,
      mobilityLevel: draft.mobilityLevel,
      isHospitalDischarge: draft.isHospitalDischarge === 'yes',
      hospitalName: draft.hospitalName || undefined,
      documents: documents
        .filter((d) => d.status === 'done')
        .map((d) => ({
          key: d.key ?? '',
          fileName: d.file.name,
          sizeBytes: d.file.size,
          contentType: d.file.type,
        })),
      pincode: draft.pincode,
      addressLine: draft.addressLine,
      landmark: draft.landmark || undefined,
      preferredStartDate: draft.preferredStartDate,
      preferredTime: draft.preferredTime || undefined,
      bookerName: draft.bookerName,
      relationshipToPatient: draft.relationshipToPatient,
      bookerPhone: `+91${draft.bookerPhone}`,
      bookerEmail: draft.bookerEmail || undefined,
      preferredContact: draft.preferredContact,
      genderPreference: draft.genderPreference,
      languagePreference: draft.languagePreference,
      healthDataConsent: { accepted: true, textVersion: brand.legal.consentTextVersion },
      termsConsent: { accepted: true, textVersion: brand.legal.consentTextVersion },
      phoneVerificationToken: otpToken ?? undefined,
      source: 'web',
    });

    if (result) {
      track('booking_submitted', { reference: result.reference, serviceSlug: draft.serviceSlug });
      clearDraft();
      navigate('/book/confirmation', {
        state: {
          reference: result.reference,
          persisted: result.persisted,
          // The confirmation reads back what was asked for, so it needs the
          // service name and the number we will ring. The draft is cleared
          // above, so these have to travel with the navigation.
          serviceName: chosenService?.name,
          bookerPhone: draft.bookerPhone,
        },
        replace: true,
      });
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <Seo
        title={`Request care - ${brand.name}`}
        description="Tell us what you need and a coordinator calls you back. Four short steps, and nothing is charged at this stage."
        path="/book"
        noindex
      />

      <h1 className="text-[clamp(1.5rem,3.2vw,2.125rem)] leading-[1.05] tracking-[-.03em]">
        Request care
      </h1>

      <div className="mt-[clamp(.625rem,1.4vw,.875rem)] grid items-start gap-[clamp(.75rem,1.8vw,1.25rem)] min-[900px]:grid-cols-[minmax(0,1fr)_272px]">
        <div className="flex min-w-0 flex-col gap-[clamp(.625rem,1.3vw,.8125rem)]">
          <div className="mt-[clamp(1.25rem,3vw,1.75rem)]">
            <StepBars steps={STEPS} current={step} />
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-feature border border-line bg-surface p-[clamp(1.125rem,2.6vw,1.625rem)] shadow-[0_26px_56px_-40px_rgba(16,20,31,.28)]"
          >
            {submitError ? (
              <Alert tone="critical" title="We could not send that" live>
                <p>
                  {submitError.message} Everything you entered is still here. You can try again, or
                  call{' '}
                  <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
                    {brand.contact.phoneDisplay}
                  </a>
                  .
                </p>
              </Alert>
            ) : null}

            {/* Keyed on the step so each panel mounts fresh and plays its entrance. */}
            <div key={step} data-motion="step" className="flex flex-col gap-2">
              {step === 0 ? (
                <>
                  <OptionGroup
                    legend="What do you need"
                    error={errors.serviceSlug}
                    className="grid gap-1 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]"
                  >
                    {(services ?? []).map((s) => (
                      <ServiceOption
                        key={s.slug}
                        label={s.name}
                        selected={draft.serviceSlug === s.slug}
                        onSelect={() => update({ serviceSlug: s.slug })}
                      />
                    ))}
                  </OptionGroup>

                  <OptionGroup legend="How soon" error={errors.urgency}>
                    {URGENCY.map((o) => (
                      <OptionPill
                        key={o.value}
                        label={o.label}
                        selected={draft.urgency === o.value}
                        onSelect={() => update({ urgency: o.value })}
                      />
                    ))}
                  </OptionGroup>

                  <OptionGroup legend="How often" error={errors.durationPattern}>
                    {durationOptions.map((o) => (
                      <OptionPill
                        key={o.value}
                        label={o.label}
                        selected={draft.durationPattern === o.value}
                        onSelect={() => update({ durationPattern: o.value })}
                      />
                    ))}
                  </OptionGroup>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <div className="grid items-start gap-2 [grid-template-columns:minmax(0,1fr)_120px]">
                    <Field id="pname" label="Patient's name" error={errors.patientName}>
                      <input
                        id="pname"
                        className={cn(fieldClasses(Boolean(errors.patientName)), 'h-5.75')}
                        value={draft.patientName}
                        onChange={(e) => update({ patientName: e.target.value })}
                        placeholder="Full name"
                        autoComplete="off"
                        aria-invalid={Boolean(errors.patientName) || undefined}
                      />
                    </Field>
                    <Field id="page" label="Age" error={errors.patientAge}>
                      <input
                        id="page"
                        className={cn(fieldClasses(Boolean(errors.patientAge)), 'h-5.75')}
                        inputMode="numeric"
                        maxLength={3}
                        value={draft.patientAge}
                        onChange={(e) => update({ patientAge: e.target.value.replace(/\D/g, '') })}
                        placeholder="Years"
                        aria-invalid={Boolean(errors.patientAge) || undefined}
                      />
                    </Field>
                  </div>

                  <div className="grid items-start gap-2 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                    <OptionGroup legend="Gender" error={errors.patientGender}>
                      {PATIENT_GENDER.map((o) => (
                        <OptionPill
                          key={o.value}
                          label={o.label}
                          selected={draft.patientGender === o.value}
                          onSelect={() => update({ patientGender: o.value })}
                        />
                      ))}
                    </OptionGroup>

                    <OptionGroup legend="Coming home from hospital?" error={errors.hospitalName}>
                      <OptionPill
                        label="Yes"
                        selected={draft.isHospitalDischarge === 'yes'}
                        onSelect={() => update({ isHospitalDischarge: 'yes' })}
                      />
                      <OptionPill
                        label="No"
                        selected={draft.isHospitalDischarge === 'no'}
                        onSelect={() => update({ isHospitalDischarge: 'no', hospitalName: '' })}
                      />
                      {draft.isHospitalDischarge === 'yes' ? (
                        <input
                          aria-label="Which hospital"
                          className={cn(
                            fieldClasses(Boolean(errors.hospitalName)),
                            'h-5.75 min-w-0 flex-1 basis-[150px]',
                          )}
                          value={draft.hospitalName}
                          onChange={(e) => update({ hospitalName: e.target.value })}
                          placeholder="Which hospital"
                          aria-invalid={Boolean(errors.hospitalName) || undefined}
                        />
                      ) : null}
                    </OptionGroup>
                  </div>

                  <Field
                    id="cond"
                    label="What is the condition"
                    error={errors.conditionNotes}
                    hint={
                      <p className="text-meta text-pewter-text">
                        A sentence or two is enough. A coordinator reads this before matching anyone.
                      </p>
                    }
                  >
                    <textarea
                      id="cond"
                      rows={2}
                      className={cn(fieldClasses(Boolean(errors.conditionNotes)), 'resize-y py-[11px]')}
                      value={draft.conditionNotes}
                      onChange={(e) => update({ conditionNotes: e.target.value })}
                      maxLength={2000}
                      placeholder="Diagnosis, surgery, or what the patient needs help with."
                      aria-invalid={Boolean(errors.conditionNotes) || undefined}
                    />
                  </Field>

                  <OptionGroup legend="How mobile is the patient" error={errors.mobilityLevel}>
                    {MOBILITY.map((o) => (
                      <OptionPill
                        key={o.value}
                        label={o.label}
                        selected={draft.mobilityLevel === o.value}
                        onSelect={() => update({ mobilityLevel: o.value })}
                      />
                    ))}
                  </OptionGroup>

                  <FileUpload
                    label="Discharge summary or prescription"
                    optionalHint
                    multiple
                    maxFiles={5}
                    value={documents}
                    onChange={setDocuments}
                    hint="Helps us match the right person. You can also send it on WhatsApp later."
                  />
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <Field
                    id="pin"
                    label="Pincode"
                    error={errors.pincode}
                    hint={
                      <p
                        aria-live="polite"
                        className={cn(
                          'text-meta',
                          coverage.tone === 'positive' && 'text-positive',
                          coverage.tone === 'attention' && 'text-brass-text',
                          coverage.tone === 'muted' && 'text-pewter-text',
                        )}
                      >
                        {coverage.text}
                      </p>
                    }
                  >
                    <input
                      id="pin"
                      className={cn(
                        fieldClasses(Boolean(errors.pincode)),
                        'h-5.75 max-w-[220px] tabular-nums',
                      )}
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      value={draft.pincode}
                      onChange={(e) => update({ pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="380015"
                      aria-invalid={Boolean(errors.pincode) || undefined}
                    />
                  </Field>

                  <Field id="addr" label="Full address" error={errors.addressLine}>
                    <textarea
                      id="addr"
                      rows={2}
                      className={cn(fieldClasses(Boolean(errors.addressLine)), 'resize-y py-[11px]')}
                      value={draft.addressLine}
                      onChange={(e) => update({ addressLine: e.target.value })}
                      placeholder="Flat or house number, building, street, area"
                      aria-invalid={Boolean(errors.addressLine) || undefined}
                    />
                  </Field>

                  <Field id="mark" label="Landmark" optional>
                    <input
                      id="mark"
                      className={cn(fieldClasses(), 'h-5.75')}
                      value={draft.landmark}
                      onChange={(e) => update({ landmark: e.target.value })}
                      placeholder="Nearest crossing, temple or shop"
                    />
                  </Field>

                  <div className="flex flex-col gap-2.5">
                    <Field id="date" label="Preferred start date" error={errors.preferredStartDate}>
                      <input
                        id="date"
                        type="date"
                        className={cn(
                          fieldClasses(Boolean(errors.preferredStartDate)),
                          'h-5.75 max-w-[230px]',
                        )}
                        value={draft.preferredStartDate}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => update({ preferredStartDate: e.target.value })}
                        aria-invalid={Boolean(errors.preferredStartDate) || undefined}
                      />
                    </Field>

                    <OptionGroup legend="Preferred time" optional error={errors.preferredTime}>
                      {TIME_SLOTS.map((o) => (
                        <OptionPill
                          key={o.value}
                          label={o.label}
                          selected={draft.preferredTime === o.value}
                          onSelect={() =>
                            update({
                              preferredTime: draft.preferredTime === o.value ? '' : o.value,
                            })
                          }
                        />
                      ))}
                    </OptionGroup>
                  </div>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                    <Field id="yname" label="Your name" error={errors.bookerName}>
                      <input
                        id="yname"
                        className={cn(fieldClasses(Boolean(errors.bookerName)), 'h-5.75')}
                        autoComplete="name"
                        value={draft.bookerName}
                        onChange={(e) => update({ bookerName: e.target.value })}
                        placeholder="Full name"
                        aria-invalid={Boolean(errors.bookerName) || undefined}
                      />
                    </Field>
                    <Field
                      id="rel"
                      label="Relationship to the patient"
                      error={errors.relationshipToPatient}
                    >
                      <input
                        id="rel"
                        className={cn(
                          fieldClasses(Boolean(errors.relationshipToPatient)),
                          'h-5.75',
                        )}
                        value={draft.relationshipToPatient}
                        onChange={(e) => update({ relationshipToPatient: e.target.value })}
                        placeholder="Son, daughter, spouse"
                        aria-invalid={Boolean(errors.relationshipToPatient) || undefined}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                    <Field id="mob" label="Mobile number" error={errors.bookerPhone}>
                      <div className="flex items-center gap-1">
                        <span className="text-body text-pewter-text">+91</span>
                        <input
                          id="mob"
                          className={cn(
                            fieldClasses(Boolean(errors.bookerPhone)),
                            'h-5.75 tabular-nums',
                          )}
                          inputMode="numeric"
                          maxLength={10}
                          autoComplete="tel-national"
                          value={draft.bookerPhone}
                          onChange={(e) => {
                            update({ bookerPhone: e.target.value.replace(/\D/g, '') });
                            setOtpToken(null);
                          }}
                          placeholder="We call back on this"
                          aria-invalid={Boolean(errors.bookerPhone) || undefined}
                        />
                      </div>
                    </Field>
                    <Field id="email" label="Email" optional error={errors.bookerEmail}>
                      <input
                        id="email"
                        type="email"
                        className={cn(fieldClasses(Boolean(errors.bookerEmail)), 'h-5.75')}
                        autoComplete="email"
                        value={draft.bookerEmail}
                        onChange={(e) => update({ bookerEmail: e.target.value })}
                        placeholder="For the written confirmation"
                        aria-invalid={Boolean(errors.bookerEmail) || undefined}
                      />
                    </Field>
                  </div>

                  <PhoneVerify
                    phone={draft.bookerPhone}
                    purpose="booking"
                    verified={Boolean(otpToken)}
                    onVerified={setOtpToken}
                  />
                  {errors.otp ? <p className="text-small text-critical">{errors.otp}</p> : null}

                  <div className="grid items-start gap-2 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                    <OptionGroup legend="How should we reach you">
                      {REACH.map((o) => (
                        <OptionPill
                          key={o.value}
                          label={o.label}
                          selected={draft.preferredContact === o.value}
                          onSelect={() => update({ preferredContact: o.value })}
                        />
                      ))}
                    </OptionGroup>
                  </div>

                  <Disclosure
                    summary={
                      <>
                        Preferences for the professional{' '}
                        <span className="font-normal text-pewter-text">(optional)</span>
                      </>
                    }
                  >
                    <OptionGroup legend="Professional's gender" optional>
                      {PRO_GENDER.map((o) => (
                        <OptionPill
                          key={o.value}
                          label={o.label}
                          selected={draft.genderPreference === o.value}
                          onSelect={() => update({ genderPreference: o.value })}
                        />
                      ))}
                    </OptionGroup>

                    <OptionGroup legend="Languages" optional>
                      {LANGUAGES.map((lang) => {
                        const checked = draft.languagePreference.includes(lang);
                        return (
                          <CheckPill
                            key={lang}
                            label={lang}
                            selected={checked}
                            onToggle={() =>
                              update({
                                languagePreference: checked
                                  ? draft.languagePreference.filter((l) => l !== lang)
                                  : [...draft.languagePreference, lang],
                              })
                            }
                          />
                        );
                      })}
                    </OptionGroup>
                  </Disclosure>

                  {/* Health-data consent is worded separately from the terms,
                      because spec 7.7 requires explicit separate consent for
                      sensitive personal data under the DPDP Act. */}
                  <div className="grid gap-1.25 rounded-panel border border-line bg-pewter-lo px-1.75 py-1.5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
                    <ConsentCheck
                      checked={draft.healthConsent}
                      invalid={Boolean(errors.healthConsent)}
                      onToggle={() => update({ healthConsent: !draft.healthConsent })}
                    >
                      {brand.shortName} may process the patient&apos;s health information to arrange
                      this care.
                    </ConsentCheck>

                    <ConsentCheck
                      checked={draft.termsAccepted}
                      invalid={Boolean(errors.termsAccepted)}
                      onToggle={() => update({ termsAccepted: !draft.termsAccepted })}
                    >
                      <span>
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
                        .
                      </span>
                    </ConsentCheck>
                  </div>

                  {errors.healthConsent || errors.termsAccepted ? (
                    <p className="text-small text-critical">
                      Both agreements are needed before we can take the request.
                    </p>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="mt-1.75 flex flex-wrap-reverse items-center justify-between gap-1.25 border-t border-line pt-[13px]">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className={cn(
                  'h-6 rounded-pill border border-line bg-surface px-2.5 text-body font-medium',
                  step === 0
                    ? 'cursor-not-allowed text-pewter opacity-55'
                    : 'cursor-pointer text-ink',
                )}
              >
                Back
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="btn inline-flex h-6 cursor-pointer items-center gap-1.25 rounded-pill border-0 bg-blue px-3.25 text-body font-medium text-surface shadow-[0_12px_26px_-14px_rgba(26,65,153,.8)] disabled:opacity-75"
              >
                {submitting ? (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 animate-spin rounded-pill border-2 border-[rgba(255,255,255,.35)] border-t-surface"
                  />
                ) : null}
                {isLast ? (submitting ? 'Sending your request' : 'Send request') : 'Continue'}
                {submitting ? (
                  <span role="status" className="sr-only">
                    Sending your request
                  </span>
                ) : null}
              </button>
            </div>
          </form>

          <p className="text-meta text-pewter-text">
            Your answers stay here if you leave and come back in this tab.
          </p>
        </div>

        <BookingSummary
          service={chosenService}
          urgency={URGENCY.find((u) => u.value === draft.urgency)?.label}
          pattern={durationOptions.find((d) => d.value === draft.durationPattern)?.label}
          patientName={draft.patientName}
          patientAge={draft.patientAge}
          pincode={draft.pincode}
          fullDay={draft.durationPattern === 'twenty-four-hour'}
          night={draft.preferredTime === NIGHT_SLOT}
        />
      </div>
    </>
  );
}
