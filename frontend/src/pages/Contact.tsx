import { useState } from 'react';
import type { FormEvent } from 'react';
import { brand, telHref, whatsappHref } from '@shared/brand.js';
import { Alert, useToast } from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import { Field, OptionPill, fieldClasses } from '@/components/BookingControls.js';
import { PageHero } from '@/components/SkyHero.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema } from '@/components/Seo.js';
import { submitLead } from '@/lib/api.js';
import { useSubmit } from '@/lib/useApi.js';

const TOPICS = [
  'Arranging care',
  'An existing booking',
  'Billing',
  'Joining the network',
  'Something else',
];

/** Not in brand.ts: these are opening hours, not identity. */
const HOURS = [
  { day: 'Monday to Saturday', time: '8:00 am to 9:00 pm' },
  { day: 'Sunday', time: '9:00 am to 6:00 pm' },
];

const MAX_MESSAGE = 1000;

const { address } = brand.contact;
const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(
  `${address.line1}, ${address.line2}, ${address.city} ${address.pincode}`,
)}`;

export default function Contact() {
  return (
    <>
      <Seo
        title={`Contact - ${brand.name}`}
        description="Talk to a coordinator. Phone answered around the clock; the form is answered within one working day."
        path="/contact"
        structuredData={[
          medicalBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <PageHero
        crumb="Contact"
        title="Talk to a coordinator"
        intro="If you need care arranged today, calling is faster than this form."
      />

      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1240px] items-start gap-[clamp(1.5rem,4vw,3.25rem)] px-(--page-gutter) pt-[clamp(1.75rem,4vw,3.5rem)] pb-[clamp(3rem,7vw,5.5rem)] min-[940px]:grid-cols-[340px_minmax(0,1fr)]">
          <ContactDetails />
          <ContactForm />
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------------- */

function ContactDetails() {
  return (
    <div className="flex flex-col gap-[clamp(1.125rem,2.5vw,1.625rem)]">
      <div className="flex flex-col gap-1 rounded-[20px] border border-[rgba(26,65,153,.2)] bg-[rgba(26,65,153,.05)] p-2.5">
        <span className="font-sans text-meta font-semibold tracking-[.14em] text-blue-deep uppercase">
          Phone
        </span>
        <a
          href={telHref()}
          data-analytics="contact-call"
          className="font-display text-[clamp(1.5rem,2.4vw,1.875rem)] leading-[1.1] tracking-[-.02em] text-ink no-underline"
        >
          {brand.contact.phoneDisplay}
        </a>
        <p className="text-small text-ink-soft">
          Answered around the clock, including nights and Sundays.
        </p>
        <a
          href={whatsappHref('Hello, I would like to ask about care at home: ')}
          target="_blank"
          rel="noreferrer noopener"
          data-analytics="contact-whatsapp"
          className="mt-0.25 inline-flex items-center gap-1 self-start text-small font-medium text-blue-deep no-underline"
        >
          Or message us on WhatsApp
          <Arrow />
        </a>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-sans text-meta font-semibold tracking-[.14em] text-pewter-text uppercase">
          Office
        </span>
        <address className="text-body leading-[1.5] text-ink not-italic">
          {address.line1}
          <br />
          {address.line2}
          <br />
          {address.city} {address.pincode}
          <br />
          {address.state}
        </address>
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 self-start text-small font-medium text-blue-deep no-underline"
        >
          Open in Google Maps
          <Arrow />
        </a>
        <p className="text-meta leading-[1.5] text-pewter-text">
          The office is for administration. Care is arranged by phone and delivered at your home, so
          there is no need to visit.
        </p>
      </div>

      <div className="flex flex-col gap-1.25 border-t border-line pt-2.25">
        <span className="font-sans text-meta font-semibold tracking-[.14em] text-pewter-text uppercase">
          Hours and response times
        </span>
        <dl className="flex flex-col gap-[7px] text-[.96875rem]">
          {HOURS.map((h) => (
            <div
              key={h.day}
              className="flex justify-between gap-1.75 border-b border-[rgba(21,26,40,.08)] pb-[7px]"
            >
              <dt className="text-pewter-text">{h.day}</dt>
              <dd className="m-0 tabular-nums">{h.time}</dd>
            </div>
          ))}
        </dl>
        <p className="text-meta leading-[1.5] text-pewter-text">
          Emails and this form are answered within one working day. Anything urgent should be a
          phone call.
        </p>
        <a
          href={`mailto:${brand.contact.email}`}
          className="text-[.96875rem] font-medium text-blue-deep no-underline"
        >
          {brand.contact.email}
        </a>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function ContactForm() {
  const { toast } = useToast();
  const { submit, submitting, error } = useSubmit(submitLead);
  const [done, setDone] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});

  const remaining = MAX_MESSAGE - message.length;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const next: Record<string, string> = {};
    if (!values.name?.trim()) next.name = 'We need a name so we know who we are calling back.';
    if (!/^[6-9]\d{9}$/.test(values.phone ?? ''))
      next.phone = 'An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.';
    if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      next.email = 'That does not look like an email address we could reply to.';
    if (!topic) next.topic = 'Pick what this is about so it reaches the right person.';
    if (!message.trim()) next.message = 'Tell us what you need, even in one line.';

    setErrs(next);
    if (Object.keys(next).length > 0) return;

    const result = await submit({
      ...values,
      message,
      topic,
      source: 'contact',
      phone: `+91${values.phone}`,
    });

    if (result) {
      setDone(true);
      toast({
        tone: 'positive',
        title: 'Message sent',
        description: 'We reply within one working day.',
      });
    }
  }

  if (done) {
    return (
      <div className="rounded-feature border border-line bg-surface p-[clamp(1.25rem,3vw,2rem)] shadow-[0_26px_56px_-40px_rgba(16,20,31,.28)]">
        <div data-motion="step" className="flex flex-col items-start gap-1.75">
          <span
            aria-hidden="true"
            className="grid size-6 place-items-center rounded-pill border border-[rgba(47,111,78,.28)] bg-[rgba(47,111,78,.1)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-2.75"
              fill="none"
              stroke="var(--color-positive)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>

          <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.08] tracking-[-.025em]">
            Message sent.
          </h2>
          <p className="max-w-[46ch] text-body text-ink-soft">
            We reply within one working day. If this is urgent, call {brand.contact.phoneDisplay}{' '}
            instead, which is answered around the clock.
          </p>

          <div className="flex flex-wrap gap-1.25">
            <a
              href={telHref()}
              className="btn inline-flex h-6 items-center rounded-pill bg-blue px-3 text-body font-medium text-surface no-underline"
            >
              Call instead
            </a>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setMessage('');
                setTopic('');
                setErrs({});
              }}
              className="btn h-6 cursor-pointer rounded-pill border border-line bg-surface px-3 text-body font-medium text-ink"
            >
              Send another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-feature border border-line bg-surface p-[clamp(1.25rem,3vw,2rem)] shadow-[0_26px_56px_-40px_rgba(16,20,31,.28)]">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
        <h2 className="text-[clamp(1.375rem,2.3vw,1.6875rem)] leading-[1.12] tracking-[-.02em]">
          Send a message
        </h2>

        {error ? (
          <Alert tone="critical" title="That did not send" live>
            <p>{error.message}</p>
          </Alert>
        ) : null}

        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <Field id="cname" label="Your name" error={errs.name}>
            <input
              id="cname"
              name="name"
              autoComplete="name"
              placeholder="Full name"
              aria-invalid={Boolean(errs.name) || undefined}
              className={cn(fieldClasses(Boolean(errs.name)), 'h-6')}
            />
          </Field>

          <Field id="cmob" label="Mobile number" error={errs.phone}>
            <div
              className={cn(
                'flex items-stretch overflow-hidden rounded-panel border bg-surface',
                errs.phone ? 'border-critical' : 'border-line',
              )}
            >
              <span
                aria-hidden="true"
                className="grid place-items-center border-r border-line bg-pewter-lo px-1.5 text-small text-pewter-text"
              >
                +91
              </span>
              <input
                id="cmob"
                name="phone"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                placeholder="10 digits"
                aria-invalid={Boolean(errs.phone) || undefined}
                className="h-6 min-w-0 flex-1 border-0 bg-transparent px-1.75 text-body tabular-nums text-ink outline-none"
              />
            </div>
          </Field>

          <Field id="cmail" label="Email" optional error={errs.email}>
            <input
              id="cmail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              aria-invalid={Boolean(errs.email) || undefined}
              className={cn(fieldClasses(Boolean(errs.email)), 'h-6')}
            />
          </Field>

          <Field id="ccity" label="City" optional>
            <input
              id="ccity"
              name="city"
              placeholder={address.city}
              className={cn(fieldClasses(), 'h-6')}
            />
          </Field>
        </div>

        <fieldset className="flex flex-col gap-[9px]">
          <legend className="text-small font-medium">What is this about</legend>
          <div className="flex flex-wrap gap-1">
            {TOPICS.map((t) => (
              <OptionPill
                key={t}
                label={t}
                selected={topic === t}
                onSelect={() => {
                  setTopic(t);
                  setErrs((prev) => ({ ...prev, topic: '' }));
                }}
              />
            ))}
          </div>
          {errs.topic ? <p className="text-small text-critical">{errs.topic}</p> : null}
        </fieldset>

        <Field
          id="cmsg"
          label="Your message"
          error={errs.message}
          hint={
            <p
              className={cn(
                'text-right text-meta',
                remaining < 80 ? 'text-brass-text' : 'text-pewter-text',
              )}
            >
              {remaining} characters left
            </p>
          }
        >
          <textarea
            id="cmsg"
            name="message"
            rows={4}
            value={message}
            maxLength={MAX_MESSAGE}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What do you need, and when?"
            aria-invalid={Boolean(errs.message) || undefined}
            className={cn(fieldClasses(Boolean(errs.message)), 'resize-y py-1.5')}
          />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-line pt-1.75">
          <button
            type="submit"
            disabled={submitting}
            className="btn inline-flex h-6.5 cursor-pointer items-center gap-1.25 rounded-pill border-0 bg-blue px-3.5 text-body font-medium text-surface shadow-[0_12px_26px_-14px_rgba(26,65,153,.8)] disabled:opacity-75"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 animate-spin rounded-pill border-2 border-[rgba(255,255,255,.35)] border-t-surface"
                />
                <span role="status" className="sr-only">
                  Sending your message
                </span>
              </>
            ) : null}
            Send message
          </button>

          <a href={telHref()} className="text-small text-ink-soft no-underline">
            Urgent? Call <span className="font-medium text-ink">{brand.contact.phoneDisplay}</span>
          </a>
        </div>

        <p className="text-meta leading-[1.5] text-pewter-text">
          Please do not put medical details in this form. A coordinator will ask for what is needed
          on the call, over a channel built for it.
        </p>
      </form>
    </div>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-[15px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.17 10h11.66M15.83 10 10 4.17M15.83 10 10 15.83" />
    </svg>
  );
}
