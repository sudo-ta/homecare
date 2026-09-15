import { Link, useLocation } from 'react-router';
import { brand, telHref, whatsappHref } from '@shared/brand.js';
import { Alert } from '@shared/ui/index.js';
import { Seo } from '@/components/Seo.js';

interface ConfirmState {
  reference?: string;
  persisted?: boolean;
  serviceName?: string;
  bookerPhone?: string;
}

const NEXT = [
  {
    title: 'A coordinator calls you',
    body: `We call the number you confirmed${
      brand.callbackMinutes ? `, usually within ${brand.callbackMinutes} minutes` : ''
    }. If you miss it we try twice more before sending a message.`,
  },
  {
    title: 'We agree what is needed and quote a price',
    body: 'The figure you are given is the figure you pay. It does not change afterwards unless the care itself changes and you agree to it.',
  },
  {
    title: 'You see who is coming',
    body: 'We send the professional’s name, qualification, experience and what we verified, before they are booked. If they are not right, say so and we propose someone else.',
  },
  {
    title: 'Care begins',
    body: 'They arrive at the agreed time. The same coordinator stays with the booking for anything that comes up.',
  },
];

/**
 * The confirmation.
 *
 * One card carrying the only three facts that matter at this moment: the
 * reference, what was asked for, and the number that will ring. Everything
 * else is below it, because someone who has just sent a request reads the top
 * of the page and closes the tab.
 */
export default function BookConfirmation() {
  const { state } = useLocation() as { state: ConfirmState | null };
  const reference = state?.reference;

  return (
    <>
      <Seo
        title={`Request received - ${brand.name}`}
        description="Your care request has been received."
        path="/book/confirmation"
        noindex
      />

      {!reference ? (
        <Alert tone="info" title="Nothing to show here">
          <p>
            This page shows a request reference straight after you send one. If you have already
            submitted a request, the reference is in your SMS and email. Call{' '}
            <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
              {brand.contact.phoneDisplay}
            </a>{' '}
            and we will find it.
          </p>
        </Alert>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div
            data-motion="step"
            className="flex flex-col items-start gap-2.25 rounded-feature border border-line bg-surface p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_26px_56px_-34px_rgba(16,20,31,.3)]"
          >
            <span
              aria-hidden="true"
              className="grid size-6.5 place-items-center rounded-pill border border-[rgba(47,111,78,.28)] bg-[rgba(47,111,78,.1)]"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-3"
                fill="none"
                stroke="var(--color-positive)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>

            <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.06] tracking-[-.03em]">
              Request received. A coordinator will call you.
            </h1>

            <p className="max-w-[52ch] text-body text-ink-soft">
              {brand.callbackMinutes
                ? `We call back within ${brand.callbackMinutes} minutes, between 8am and 10pm.`
                : 'We call back shortly.'}{' '}
              Nothing is booked or charged until you agree the professional and the rate on that
              call.
            </p>

            <dl className="grid w-full gap-1 gap-x-2.5 border-t border-line pt-2.25 text-small [grid-template-columns:auto_minmax(0,1fr)]">
              <dt className="text-pewter-text">Reference</dt>
              <dd className="m-0 font-mono tabular-nums">{reference}</dd>

              {state?.serviceName ? (
                <>
                  <dt className="text-pewter-text">Service</dt>
                  <dd className="m-0">{state.serviceName}</dd>
                </>
              ) : null}

              <dt className="text-pewter-text">Calling</dt>
              <dd className="m-0 tabular-nums">
                {state?.bookerPhone ? `+91 ${state.bookerPhone}` : 'the number you gave'}
              </dd>
            </dl>

            <div className="flex flex-wrap gap-1.25">
              <Link
                to="/"
                className="btn inline-flex h-6.5 items-center rounded-pill bg-blue px-3.25 text-body font-medium text-surface no-underline"
              >
                Back to home
              </Link>
              <a
                href={telHref()}
                data-analytics="confirmation-call"
                className="btn inline-flex h-6.5 items-center rounded-pill border border-line px-3.25 text-body font-medium text-ink no-underline"
              >
                Call instead
              </a>
            </div>
          </div>

          {state?.persisted === false ? (
            <Alert tone="attention" title="This build is not connected to the API">
              <p>
                The request was validated but not saved, and no SMS or email was sent. The reference
                above is real in shape but not in a database. Point{' '}
                <code className="font-mono text-small">VITE_API_MODE</code> at{' '}
                <code className="font-mono text-small">live</code> once the backend is running.
              </p>
            </Alert>
          ) : null}

          <section className="rounded-feature border border-line bg-surface p-[clamp(1.125rem,2.6vw,1.625rem)]">
            <h2 className="text-h3">What happens next</h2>
            <ol className="mt-1.75 flex flex-col gap-2">
              {NEXT.map((n, i) => (
                <li key={n.title} className="flex gap-1.5">
                  <span
                    aria-hidden="true"
                    className="flex size-3.5 shrink-0 items-center justify-center rounded-pill bg-pewter-lo text-small font-medium text-blue-deep"
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-0.25">
                    <h3 className="text-small font-medium text-ink">{n.title}</h3>
                    <p className="measure text-small text-ink-soft">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-1.5 rounded-feature border border-[rgba(26,65,153,.2)] bg-[rgba(26,65,153,.05)] p-[clamp(1.125rem,2.6vw,1.625rem)]">
            <h2 className="text-h3">Need it sooner, or something changed?</h2>
            <p className="text-small text-ink-soft">
              Call us and quote {reference}. It is faster than waiting for the callback.
            </p>
            <div className="flex flex-wrap gap-1.25">
              <a
                href={whatsappHref(`Hello, about my request ${reference}: `)}
                target="_blank"
                rel="noreferrer noopener"
                data-analytics="confirmation-whatsapp"
                className="btn inline-flex h-6 items-center rounded-pill border border-line bg-surface px-2.5 text-small font-medium text-ink no-underline"
              >
                Message on WhatsApp
              </a>
              <Link
                to="/blog"
                className="btn inline-flex h-6 items-center rounded-pill border border-line bg-surface px-2.5 text-small font-medium text-ink no-underline"
              >
                Read while you wait
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
