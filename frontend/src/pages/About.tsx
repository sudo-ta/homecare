import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { Alert, Card, CardBody, buttonClasses } from '@shared/ui/index.js';
import { Avatar } from '@/components/Avatar.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema } from '@/components/Seo.js';
import { getTeam } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

const VETTING = [
  {
    title: 'Identity, against a government photo ID',
    body: 'Matched to the person in front of us, so the checks and the professional are the same human being.',
  },
  {
    title: 'Qualification, with the issuing institution',
    body: 'Verified with the college or board directly, not read off a photocopy.',
  },
  {
    title: 'Council registration, and its expiry date',
    body: 'Checked against the state nursing, medical or physiotherapy register. Expiry goes into a calendar that alerts us thirty days out.',
  },
  {
    title: 'Police verification',
    body: 'On file before placement. Where one is pending we say so before assigning, and you can decline.',
  },
  {
    title: 'Two previous employers, telephoned',
    body: 'Actually called, not emailed. This finds more than any document check.',
  },
];

export default function About() {
  const { data: team } = useApi(getTeam, []);

  return (
    <>
      <Seo
        title={`About ${brand.name}`}
        description="Who runs this service, how professionals are vetted, and who is clinically accountable for the care given in your home."
        path="/about"
        structuredData={[
          medicalBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <div className="measure flex flex-col gap-2">
          <h1 className="text-h1">Why this exists</h1>
          <p className="text-body-lg text-ink-soft">
            Most people who end up in a hospital bed for weeks do not clinically need to be there.
            They are there because the alternative - proper care at home, from someone qualified,
            who turns up - is hard to arrange and harder to trust.
          </p>
          <p className="text-body text-ink-soft">
            {brand.name} exists to make that alternative ordinary. The promise is narrow and
            specific: you know who is coming, you know what they are qualified to do, you know what
            it costs before you commit, and there is one coordinator who answers the phone when
            something goes wrong at six in the morning.
          </p>
        </div>
      </Section>

      <Section tone="tinted" spacing="tight">
        <SectionHeading
          title="How we vet people"
          intro="Every professional goes through all five checks before being placed with a patient. Nobody is placed on a partial check."
        />
        <ol className="mt-3 grid gap-2 md:grid-cols-2">
          {VETTING.map((v, i) => (
            <li key={v.title}>
              <Card className="h-full">
                <CardBody className="flex gap-1.5">
                  <span
                    aria-hidden="true"
                    className="flex size-4 shrink-0 items-center justify-center rounded-pill border border-ink text-small font-medium text-ink"
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-h3">{v.title}</h3>
                    <p className="text-body text-ink-soft">{v.body}</p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section spacing="tight">
        <SectionHeading
          title="Clinical governance"
          intro="Someone is accountable for the clinical decisions this service makes. That person is named, and it is not a call centre."
        />
        <div className="measure mt-2 flex flex-col gap-1.5">
          <p className="text-body text-ink-soft">
            A clinical director sets the protocols, decides which cases can safely be taken at home,
            and reviews every incident. Care plans follow the treating doctor&rsquo;s written
            instructions, and where those instructions are unclear we call the hospital rather than
            guess. Nothing is changed without telling you first.
          </p>
          <p className="text-body text-ink-soft">
            We say no to cases that belong in a hospital. That is a real part of the job, and a
            provider who never turns anything down is not assessing anything.
          </p>
        </div>

        {team && team.length > 0 ? (
          <ul className="mt-3 grid gap-2 md:grid-cols-3">
            {team.map((m) => (
              <li key={m.id}>
                <Card className="h-full">
                  <CardBody className="flex flex-col gap-1.5">
                    <Avatar name={m.name} photoUrl={m.photoUrl} size="lg" />
                    <div>
                      <h3 className="text-h3">{m.name}</h3>
                      <p className="text-small text-ink-soft">{m.role}</p>
                    </div>
                    <p className="text-body text-ink-soft">{m.bio}</p>
                    <ul className="flex flex-col gap-0.25">
                      {m.credentials.map((c) => (
                        <li key={c} className="text-small text-ink">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Alert tone="info" className="mt-3">
            <p>
              Leadership profiles are published once each person has agreed to appear here by name.
              Until then, ask a coordinator who is clinically accountable for your booking and they
              will tell you.
            </p>
          </Alert>
        )}
      </Section>

      <Section tone="tinted" spacing="tight">
        <SectionHeading
          title="Registration and compliance"
          intro="What we are registered as, and what that does and does not cover."
        />
        <div className="measure mt-2 flex flex-col gap-1.5 text-body text-ink-soft">
          <p>
            {brand.legal.clinicalEstablishmentRegNo
              ? `Clinical establishment registration ${brand.legal.clinicalEstablishmentRegNo}.`
              : 'Clinical establishment registration details are published here once issued.'}{' '}
            Every clinical professional in the network holds a current registration with their own
            state council, checked by us and tracked for expiry.
          </p>
          <p>
            Health information you give us is sensitive personal data under India&rsquo;s DPDP Act
            2023. We ask for consent separately and in plain words at the point we collect it, log
            what you agreed to and when, encrypt condition notes and uploaded documents, and record
            every access to a patient record. Our{' '}
            <Link to="/privacy" className="font-medium text-ink underline underline-offset-2">
              privacy policy
            </Link>{' '}
            sets out what we keep, for how long, and how to ask us to delete it.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <Link to="/contact" className={buttonClasses('primary', 'md')}>
            Ask us something specific
          </Link>
          <a href={telHref()} className={buttonClasses('secondary', 'md')} data-analytics="about-call">
            Call {brand.contact.phoneDisplay}
          </a>
        </div>
      </Section>
    </>
  );
}
