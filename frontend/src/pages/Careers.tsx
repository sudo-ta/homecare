import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  Input,
  Select,
  Skeleton,
  SkeletonGroup,
  Textarea,
  buttonClasses,
  useToast,
} from '@shared/ui/index.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { getJobs, submitCareerApplication } from '@/lib/api.js';
import { formatDateShort } from '@/lib/format.js';
import { useApi, useSubmit } from '@/lib/useApi.js';

const TYPE_LABEL = {
  'full-time': 'Full time',
  'part-time': 'Part time',
  contract: 'Contract',
  'visit-based': 'Paid per visit',
} as const;

export default function Careers() {
  const { data: jobs, loading } = useApi(getJobs, []);
  const hasOpenings = (jobs?.length ?? 0) > 0;

  return (
    <>
      <Seo
        title={`Careers - ${brand.name}`}
        description="Open roles in operations, verification and clinical care. If nothing fits, tell us what you do and we will keep it on file."
        path="/careers"
        structuredData={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Careers', path: '/careers' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">Work with us</span>}
          intro="Small team, real responsibility. If you are a nurse, caregiver or physiotherapist wanting visit work rather than a salaried role, the network application is the better route."
          aside={
            <Link to="/partner" className={buttonClasses('secondary', 'md')}>
              Join the care network instead
            </Link>
          }
        />
      </Section>

      <Section spacing="tight" className="!pt-0">
        {loading ? (
          <SkeletonGroup label="Loading roles" className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} shape="card" className="h-[12rem]" />
            ))}
          </SkeletonGroup>
        ) : !hasOpenings ? (
          <EmptyState
            title="No open roles right now"
            size="page"
            action={
              <a href={`mailto:${brand.contact.careersEmail}`} className={buttonClasses('secondary', 'md')}>
                Email {brand.contact.careersEmail}
              </a>
            }
          >
            We are not hiring at the moment. Leave your details in the form below and we will come
            back to you when something opens that fits what you do.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-2">
            {jobs?.map((job) => (
              <li key={job.slug}>
                <Card>
                  <CardBody className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-1">
                      <div className="flex flex-col gap-0.5">
                        <h2 className="text-h3">{job.title}</h2>
                        <p className="text-small text-ink-soft">
                          {job.department} &middot; {job.location} &middot; posted{' '}
                          {formatDateShort(job.postedAt)}
                        </p>
                      </div>
                      <Badge>{TYPE_LABEL[job.employmentType]}</Badge>
                    </div>

                    <p className="measure text-body text-ink-soft">{job.description}</p>

                    <div>
                      <h3 className="text-small font-semibold text-ink">What we are looking for</h3>
                      <ul className="mt-0.5 flex list-disc flex-col gap-0.5 pl-3">
                        {job.requirements.map((r) => (
                          <li key={r} className="measure text-body text-ink-soft">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a href={`#apply`} className={`${buttonClasses('primary', 'md')} self-start`}>
                      Apply for this role
                    </a>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section tone="tinted" spacing="tight" id="apply">
        <SectionHeading
          title={hasOpenings ? 'Apply' : 'Tell us what you do'}
          intro={
            hasOpenings
              ? 'One form for every role. Tell us which one, and what you have done that is relevant.'
              : 'We keep general applications on file and read them when a role opens.'
          }
        />
        <div className="mt-3 max-w-[38rem]">
          <CareerForm jobs={jobs ?? []} />
        </div>
      </Section>
    </>
  );
}

function CareerForm({ jobs }: { jobs: { slug: string; title: string }[] }) {
  const { toast } = useToast();
  const { submit, submitting, error } = useSubmit(submitCareerApplication);
  const [done, setDone] = useState(false);
  const [surfaceErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = Object.fromEntries(form) as Record<string, string>;

    const errs: Record<string, string> = {};
    if (!values.fullName?.trim()) errs.fullName = 'We need a name to put on the application.';
    if (!/^[6-9]\d{9}$/.test(values.phone ?? ''))
      errs.phone = 'An Indian mobile number is ten digits and starts with 6, 7, 8 or 9.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email ?? ''))
      errs.email = 'That does not look like an email address we could reply to.';
    if (!values.about?.trim())
      errs.about = 'Tell us something about what you have done. Two or three sentences is plenty.';

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = await submit({ ...values, phone: `+91${values.phone}` });
    if (result) {
      setDone(true);
      toast({ tone: 'positive', title: 'Application sent', description: `Reference ${result.reference}` });
    }
  }

  if (done) {
    return (
      <Alert tone="positive" title="We have your application" live>
        <p>
          Someone reads every application. If it looks like a fit we will call you within a week. If
          you have not heard in two weeks, we did not have a role for it this time.
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      {error ? (
        <Alert tone="critical" title="That did not send" live>
          <p>{error.message}</p>
        </Alert>
      ) : null}

      <Input
        label="Your name"
        name="fullName"
        autoComplete="name"
        required
        error={surfaceErrors.fullName}
      />
      <Input
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="numeric"
        maxLength={10}
        prefix="+91"
        autoComplete="tel-national"
        required
        error={surfaceErrors.phone}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={surfaceErrors.email}
      />

      {jobs.length > 0 ? (
        <Select
          label="Which role"
          name="role"
          options={[
            ...jobs.map((j) => ({ value: j.slug, label: j.title })),
            { value: 'general', label: 'Something else, or not sure' },
          ]}
          placeholder="Pick the role you are applying for"
          defaultValue=""
          required
        />
      ) : (
        <Input label="What you do" name="role" placeholder="Nurse, coordinator, physiotherapist" required />
      )}

      <Textarea
        label="What you have done that is relevant"
        name="about"
        rows={5}
        maxLength={1200}
        showCount
        required
        error={surfaceErrors.about}
        hint="Two or three sentences. Where you worked, for how long, and what you handled."
      />

      <Button type="submit" size="lg" loading={submitting} loadingLabel="Sending your application">
        Submit application
      </Button>

      <p className="text-small text-ink-soft">
        Prefer email? Send it to{' '}
        <a
          href={`mailto:${brand.contact.careersEmail}`}
          className="font-medium text-ink underline underline-offset-2"
        >
          {brand.contact.careersEmail}
        </a>
        , or call{' '}
        <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
          {brand.contact.phoneDisplay}
        </a>
        .
      </p>
    </form>
  );
}
