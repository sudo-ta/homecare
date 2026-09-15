import { Link } from 'react-router';
import { brand } from '@shared/brand.js';
import { Alert } from '@shared/ui/index.js';
import { ArticleBody } from '@/components/ArticleBody.js';
import { Section } from '@/components/Section.js';
import { Seo } from '@/components/Seo.js';

const UPDATED = '15 September 2026';

const BODY = `${brand.legalName} ("we") provides home healthcare services. This policy explains what we collect, why, how long we keep it, and what you can ask us to do with it.

Health information is sensitive personal data under India's Digital Personal Data Protection Act 2023. We treat it that way from the point of collection rather than retrofitting protection later.

## What we collect

**When you ask for care**, we collect the patient's name, age, gender, a brief description of their condition, their mobility level, the address where care is needed, and any discharge summary or prescription you choose to upload. We also collect your own name, relationship to the patient, phone number and email.

**When you check a pincode**, we record the pincode and whether it was covered. If you join a waitlist we also keep the phone number you gave.

**When you apply to join the network**, we collect your identity, qualification and registration documents, contact details and work history.

**When you use the site**, we record which pages were visited and which steps of a form were completed. We do not use third-party advertising or analytics scripts, and we do not load a tracker that follows you to other sites.

## Why we collect it

- To arrange and deliver the care you asked for
- To verify that the professional sent to your home is who they say they are and qualified to do the work
- To meet our record-keeping obligations as a healthcare provider
- To understand where demand exists that we cannot yet serve, which is why the pincode check is recorded

We do not sell personal data. We do not share it for anyone else's marketing.

## Consent

We ask for consent to process health data separately from the rest of the form, in plain words, at the point we collect it. We record what the consent text said, the version of it you were shown, when you agreed, and the IP address it came from.

You can withdraw consent at any time by writing to ${brand.contact.email}. Withdrawing consent means we can no longer arrange care, because we cannot safely send a professional to a patient whose condition we are not permitted to record.

## Who sees it

Inside our organisation, access is limited by role. A coordinator arranging your booking sees what they need to arrange it. Not every member of staff can see a patient's condition notes. Every access to a patient record is logged, including reads.

Outside our organisation, we share the minimum necessary with:

- **The professional assigned to your booking**, who needs the address and the clinical instructions
- **Partner laboratories**, where you have booked a test, limited to what the test requires
- **Our technology providers**, who host the systems under contract and cannot use the data for anything else

## Where it is stored and how it is protected

Data is stored in India. Condition notes and uploaded documents are encrypted at the surface and object level, not merely on the disk underneath. Uploaded documents are held in private storage and are only ever served through short-lived links, never a public URL.

Photographs taken on a phone carry GPS coordinates in their metadata. We strip that metadata from every image on receipt, because a discharge summary photographed at home would otherwise record exactly where the patient lives.

## How long we keep it

- **Patient and booking records**: retained while care is ongoing and for the period our record-keeping obligations as a healthcare provider require, then deleted
- **Professional credentials**: while the professional is in the network, and for a limited period afterwards for audit
- **Leads and waitlist numbers**: two years, or until you ask us to remove them
- **Site usage records**: aggregated after ninety days so they no longer identify anyone

## Your rights

Under the DPDP Act you can ask us to:

- Tell you what we hold about you and who we have shared it with
- Correct anything inaccurate
- Delete what we hold, where we are not required to keep it
- Nominate someone to exercise these rights if you are unable to

Write to ${brand.contact.email}. We respond within thirty days. If you are not satisfied with our response you can complain to the Data Protection Board of India.

## Children

We do not knowingly collect data directly from anyone under eighteen. Where a patient is a minor, we deal with a parent or guardian, and consent is theirs to give.

## Changes

If this policy changes materially we will tell anyone with an active booking directly rather than only updating this page.`;

export default function Privacy() {
  return (
    <>
      <Seo
        title={`Privacy policy - ${brand.name}`}
        description="What we collect, why, how long we keep it, and how to ask us to delete it. Written against India's DPDP Act 2023."
        path="/privacy"
      />

      <Section spacing="tight">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1">Privacy policy</h1>
          <p className="text-small text-ink-soft">Last updated {UPDATED}</p>

          <Alert tone="attention" className="my-2">
            <p>
              <strong className="font-semibold">Draft, pending legal review.</strong> This policy
              describes what the system this site runs on actually does, and it has not yet been
              reviewed by a lawyer. Spec-level obligations under the DPDP Act 2023 and the clinical
              establishment rules applicable in {brand.contact.address.state} must be confirmed with
              counsel before launch.
            </p>
          </Alert>

          <ArticleBody body={BODY} />

          <p className="measure mt-2 text-body text-ink-soft">
            See also our{' '}
            <Link to="/terms" className="font-medium text-ink underline underline-offset-2">
              terms of service
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
