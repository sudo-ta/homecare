import { useState } from 'react';
import type { FormEvent } from 'react';
import { brand, telHref, whatsappHref } from '@shared/brand.js';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Textarea,
  useToast,
} from '@shared/ui/index.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema } from '@/components/Seo.js';
import { submitLead } from '@/lib/api.js';
import { useSubmit } from '@/lib/useApi.js';

const SUBJECTS = [
  { value: 'new-booking', label: 'I need care arranged' },
  { value: 'existing-booking', label: 'A booking I already have' },
  { value: 'billing', label: 'Billing or a payment' },
  { value: 'complaint', label: 'Something went wrong' },
  { value: 'partnership', label: 'Partnership or institutional enquiry' },
  { value: 'other', label: 'Something else' },
];

export default function Contact() {
  return (
    <>
      <Seo
        title={`Contact ${brand.name}`}
        description={`Call ${brand.contact.phoneDisplay}, message us on WhatsApp, or send a note. Office in ${brand.contact.address.city}.`}
        path="/contact"
        structuredData={[
          medicalBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">Talk to a coordinator</span>}
          intro="If you need care arranged today, calling is faster than this form."
        />

        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_1.1fr] lg:gap-6">
          <div className="flex flex-col gap-2">
            <Card>
              <CardBody className="flex flex-col gap-1.5">
                <h2 className="text-h3">Phone</h2>
                <a
                  href={telHref()}
                  data-analytics="contact-page-call"
                  className="text-h2 text-ink underline underline-offset-4"
                >
                  {brand.contact.phoneDisplay}
                </a>
                <p className="text-body text-ink-soft">
                  {brand.contact.isPhoneStaffedAllHours
                    ? 'Answered around the clock, including nights and Sundays.'
                    : 'Answered during the hours below.'}
                </p>
                <a
                  href={whatsappHref('Hello, I need care at home.')}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-analytics="contact-page-whatsapp"
                  className="text-body font-medium text-ink underline underline-offset-2"
                >
                  Or message us on WhatsApp
                </a>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col gap-1.5">
                <h2 className="text-h3">Office</h2>
                <address className="text-body text-ink not-italic">
                  {brand.contact.address.line1}
                  <br />
                  {brand.contact.address.line2}
                  <br />
                  {brand.contact.address.city} {brand.contact.address.pincode}
                  <br />
                  {brand.contact.address.state}
                </address>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${brand.contact.address.line1}, ${brand.contact.address.line2}, ${brand.contact.address.city} ${brand.contact.address.pincode}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-body font-medium text-ink underline underline-offset-2"
                >
                  Open in Google Maps
                </a>
                {/* A real embedded map would load a third-party iframe that sets
                    cookies before consent. On a site collecting health data that
                    is the wrong default, so the map is a link out instead. */}
                <p className="text-small text-ink-soft">
                  The office is for administration. Care is arranged by phone and delivered at your
                  home, so there is no need to visit.
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-col gap-1.5">
                <h2 className="text-h3">Hours and response times</h2>
                <dl className="flex flex-col gap-0.5">
                  {brand.contact.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-2 text-body">
                      <dt className="text-ink-soft">{h.days}</dt>
                      <dd className="text-ink">{h.time}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-body text-ink-soft">
                  Emails and this form are answered within one working day. Anything urgent should
                  be a phone call.
                </p>
                <a
                  href={`mailto:${brand.contact.email}`}
                  className="text-body font-medium text-ink underline underline-offset-2"
                >
                  {brand.contact.email}
                </a>
              </CardBody>
            </Card>
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}

function ContactForm() {
  const { toast } = useToast();
  const { submit, submitting, error } = useSubmit(submitLead);
  const [done, setDone] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const next: Record<string, string> = {};
    if (!values.name?.trim()) next.name = 'We need a name so we know who we are calling back.';
    if (!/^[6-9]\d{9}$/.test(values.phone ?? ''))
      next.phone = 'An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.';
    if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      next.email = 'That does not look like an email address we could reply to.';
    if (!values.message?.trim()) next.message = 'Tell us what you need, even in one line.';

    setErrs(next);
    if (Object.keys(next).length > 0) return;

    const result = await submit({ ...values, source: 'contact', phone: `+91${values.phone}` });
    if (result) {
      setDone(true);
      toast({ tone: 'positive', title: 'Message sent', description: 'We reply within one working day.' });
    }
  }

  if (done) {
    return (
      <Alert tone="positive" title="We have your message" live>
        <p>
          A coordinator replies within one working day. If it is urgent, call{' '}
          <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
            {brand.contact.phoneDisplay}
          </a>{' '}
          rather than waiting.
        </p>
      </Alert>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
          <h2 className="text-h3">Send a message</h2>

          {error ? (
            <Alert tone="critical" title="That did not send" live>
              <p>{error.message}</p>
            </Alert>
          ) : null}

          <Input label="Your name" name="name" autoComplete="name" required error={errs.name} />
          <Input
            label="Mobile number"
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            prefix="+91"
            autoComplete="tel-national"
            required
            error={errs.phone}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            optionalHint
            error={errs.email}
          />
          <Input label="City" name="city" optionalHint placeholder="Ahmedabad" />
          <Select
            label="What is this about"
            name="subject"
            options={SUBJECTS}
            placeholder="Pick the closest one"
            defaultValue=""
            required
          />
          <Textarea
            label="Your message"
            name="message"
            rows={5}
            maxLength={1000}
            showCount
            required
            error={errs.message}
          />

          <Button type="submit" size="lg" loading={submitting} loadingLabel="Sending your message">
            Send message
          </Button>

          <p className="text-small text-ink-soft">
            Please do not put medical details in this form. A coordinator will ask for what is
            needed on the call, over a channel built for it.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
