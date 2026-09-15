import { Link, useLocation } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { Alert, Card, CardBody, buttonClasses } from '@shared/ui/index.js';
import { Section } from '@/components/Section.js';
import { Seo } from '@/components/Seo.js';

interface ConfirmState {
  reference?: string;
  persisted?: boolean;
  applicantType?: 'individual' | 'institution';
  policeVerificationMissing?: boolean;
}

/** Spec 6.5: show the pipeline after submission, so waiting has a shape. */
const PIPELINE = [
  {
    title: 'Application received',
    body: 'A person reads it, not a filter. If something is missing we call you rather than rejecting it.',
  },
  {
    title: 'Documents verified',
    body: 'Two to three working days. We check your registration against the state council register, confirm your qualification with the institution, and telephone two previous employers.',
  },
  {
    title: 'Onboarding and orientation',
    body: 'A half-day session on how bookings work, what the coordinator expects, and what to do when something goes wrong in a patient’s home.',
  },
  {
    title: 'Assignments begin',
    body: 'You set which areas and shifts you accept. You are never assigned work you have not agreed to.',
  },
];

export default function PartnerConfirmation() {
  const { state } = useLocation() as { state: ConfirmState | null };
  const reference = state?.reference;

  return (
    <>
      <Seo
        title={`Application received - ${brand.name}`}
        description="Your application to join the care network has been received."
        path="/partner/confirmation"
        noindex
      />

      <Section spacing="tight">
        <div className="mx-auto flex w-full max-w-[42rem] flex-col gap-3">
          {!reference ? (
            <Alert tone="info" title="Nothing to show here">
              <p>
                This page shows your reference straight after you apply. If you have already
                applied, the reference is in your SMS and email. Call{' '}
                <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
                  {brand.contact.phoneDisplay}
                </a>{' '}
                and we will find it.
              </p>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-h1">Application received</h1>
                <p className="measure text-body-lg text-ink-soft">
                  Thank you for applying. Verification takes two to three working days, and we
                  contact you either way, including if the answer is no.
                </p>
              </div>

              <Card>
                <CardBody className="flex flex-col gap-1">
                  <p className="text-small text-ink-soft">Your reference</p>
                  <p className="font-mono text-h2 text-ink">{reference}</p>
                  <p className="text-small text-ink-soft">Quote this if you call us about it.</p>
                </CardBody>
              </Card>

              {state?.persisted === false ? (
                <Alert tone="attention" title="This build is not connected to the API">
                  <p>
                    The application was validated but not saved, and no documents were uploaded to
                    storage. Point <code className="font-mono text-small">VITE_API_MODE</code> at{' '}
                    <code className="font-mono text-small">live</code> once the backend is running.
                  </p>
                </Alert>
              ) : null}

              {state?.policeVerificationMissing ? (
                <Alert tone="attention" title="Police verification still needed">
                  <p>
                    You did not upload one, which does not stop the application. We will tell you
                    how to apply for it, and your file is marked until it arrives. We do not place
                    anyone with a patient before it is on file.
                  </p>
                </Alert>
              ) : null}

              <div>
                <h2 className="text-h2">What happens next</h2>
                <ol className="mt-2 flex flex-col gap-2">
                  {PIPELINE.map((p, i) => (
                    <li key={p.title} className="flex gap-1.5">
                      <span
                        aria-hidden="true"
                        className="flex size-4 shrink-0 items-center justify-center rounded-pill border border-ink text-small font-medium text-ink"
                      >
                        {i + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-h3">{p.title}</h3>
                        <p className="measure text-body text-ink-soft">{p.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <Card variant="tinted">
                <CardBody className="flex flex-col gap-1.5">
                  <h2 className="text-h3">Something to add, or a question?</h2>
                  <p className="text-body text-ink-soft">
                    Call us and quote {reference}, or email{' '}
                    <a
                      href={`mailto:${brand.contact.careersEmail}`}
                      className="font-medium text-ink underline underline-offset-2"
                    >
                      {brand.contact.careersEmail}
                    </a>
                    .
                  </p>
                  <a
                    href={telHref()}
                    data-analytics="partner-confirmation-call"
                    className={`${buttonClasses('primary', 'md')} self-start`}
                  >
                    Call {brand.contact.phoneDisplay}
                  </a>
                </CardBody>
              </Card>
            </>
          )}

          <div className="flex flex-wrap gap-1 border-t border-line pt-2">
            <Link to="/" className={buttonClasses('ghost', 'md')}>
              Back to the home page
            </Link>
            <Link to="/blog" className={buttonClasses('ghost', 'md')}>
              Read our articles
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
