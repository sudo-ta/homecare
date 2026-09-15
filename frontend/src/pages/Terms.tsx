import { Link } from 'react-router';
import { brand } from '@shared/brand.js';
import { Alert } from '@shared/ui/index.js';
import { ArticleBody } from '@/components/ArticleBody.js';
import { Section } from '@/components/Section.js';
import { Seo } from '@/components/Seo.js';

const UPDATED = '15 September 2026';

const BODY = `These terms govern the services ${brand.legalName} provides. By booking, you agree to them.

## What we are

We arrange qualified professionals to deliver care in your home. We are not a hospital and we are not an emergency service.

**We do not respond to emergencies.** If someone has chest pain, breathing difficulty, a suspected stroke, a seizure or heavy bleeding, call an ambulance. We will not be faster, and delay costs more than the call.

## Booking and confirmation

A request through this site is a request, not a confirmed booking. A coordinator calls you back, confirms what is needed, and quotes a price. The booking exists once you accept that quote.

We may decline a booking. The most common reason is that the case needs a level of monitoring that cannot safely be provided at home. Saying no to those is part of the job.

## Pricing

Prices on this site are indicative starting figures, not quotes. The figure you are given before the booking starts is the figure you pay. It does not change afterwards unless you agree to a change in the care itself.

Consumables, medicines and dressing material are billed at cost with the receipt attached, and are not included in the shift or visit price.

## Cancellation

- More than 12 hours before the shift: no charge
- Less than 12 hours: half the shift charged, because the professional has already turned down other work
- After the professional has arrived: the full shift

For ongoing monthly bookings, seven days' notice ends the arrangement with no further charge.

If we cancel, or if a professional does not arrive and we cannot send a replacement, you are not charged for that shift.

## What the professional will and will not do

Each service page lists what is included and what is not. In general, clinical tasks are done only by clinically qualified staff, caregivers do not perform clinical tasks, and nobody diagnoses or changes a prescription. That is a doctor's decision.

Professionals will not undertake household work beyond what the patient's own care requires.

## Your responsibilities

- Give us accurate clinical information. A professional working from an incomplete picture is a safety risk to the patient.
- Provide a safe working environment, including somewhere to wash hands and, on a 24-hour booking, somewhere to rest.
- Do not ask the professional to do work outside the agreed scope.
- Pay through us. If anyone asks you for cash directly, tell us; it is grounds for removal from the network.

## Changing the assigned professional

You can ask for a different professional at any time and do not need to give a reason. It is not a complaint and it happens often enough that we plan for it.

## Complaints

Tell the coordinator first, since most things are fixed the same day. Anything unresolved goes to ${brand.contact.email} and is answered within three working days. Clinical incidents are reviewed by the clinical director.

## Liability

We are responsible for the acts and omissions of professionals we assign while they are delivering care we arranged. We are not responsible for outcomes that follow the treating doctor's instructions being wrong, for a patient's underlying condition, or for care you arrange directly with a professional outside our booking.

Nothing here limits liability that cannot be limited in law.

## Governing law

These terms are governed by the laws of India, and the courts at ${brand.contact.address.city} have jurisdiction.`;

export default function Terms() {
  return (
    <>
      <Seo
        title={`Terms of service - ${brand.name}`}
        description="What we do and do not provide, how booking and cancellation work, pricing, and who is responsible for what."
        path="/terms"
      />

      <Section spacing="tight">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1">Terms of service</h1>
          <p className="text-small text-ink-soft">Last updated {UPDATED}</p>

          <Alert tone="attention" className="my-2">
            <p>
              <strong className="font-semibold">Draft, pending legal review.</strong> These terms
              describe how the service is intended to operate and have not been reviewed by a
              lawyer. The cancellation terms and the liability section in particular need confirming
              against what operations will actually commit to.
            </p>
          </Alert>

          <ArticleBody body={BODY} />

          <p className="measure mt-2 text-body text-ink-soft">
            See also our{' '}
            <Link to="/privacy" className="font-medium text-ink underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
