import { Link, useParams } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import {
  Accordion,
  Alert,
  Badge,
  Card,
  CardBody,
  Skeleton,
  SkeletonGroup,
  buttonClasses,
} from '@shared/ui/index.js';
import { PincodeCheck } from '@/components/PincodeCheck.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema, faqSchema, serviceSchema } from '@/components/Seo.js';
import { ServiceIcon } from '@/components/ServiceIcon.js';
import { getService } from '@/lib/api.js';
import { durationLabel, money, priceUnitLabel } from '@/lib/format.js';
import { useApi } from '@/lib/useApi.js';
import NotFound from './NotFound.js';

export default function ServiceDetail() {
  const { slug = '' } = useParams();
  const { data: service, loading, error } = useApi(() => getService(slug), [slug]);

  if (loading) {
    return (
      <Section>
        <SkeletonGroup label="Loading service" className="flex flex-col gap-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton shape="card" className="mt-2 h-[24rem]" />
        </SkeletonGroup>
      </Section>
    );
  }

  if (error?.code === 'service_not_found' || (!loading && !service)) return <NotFound />;

  if (error || !service) {
    return (
      <Section>
        <Alert tone="critical" title="We could not load this service" live>
          <p>
            That is a problem at our end. Call{' '}
            <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
              {brand.contact.phoneDisplay}
            </a>{' '}
            and a coordinator will talk you through it.
          </p>
        </Alert>
      </Section>
    );
  }

  return (
    <>
      <Seo
        title={`${service.name} at home - ${brand.name}`}
        description={service.summary}
        path={`/services/${service.slug}`}
        structuredData={[
          serviceSchema({
            name: service.name,
            description: service.summary,
            slug: service.slug,
            price: service.basePrice,
            priceUnit: priceUnitLabel(service.priceUnit),
          }),
          faqSchema(service.faqs),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />

      <Section spacing="tight">
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-0.5 text-small text-ink-soft">
            <li>
              <Link to="/" className="underline-offset-2 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/services" className="underline-offset-2 hover:underline">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink">{service.name}</li>
          </ol>
        </nav>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-6">
          <div className="flex flex-col gap-2">
            <ServiceIcon category={service.category} className="size-6 text-ink" />
            <h1 className="text-h1">{service.name}</h1>
            <p className="measure text-body-lg text-ink-soft">{service.description}</p>
          </div>

          {/* Booking panel. Sticky on desktop so the CTA is always reachable
              while reading a long page. */}
          <Card className="h-fit lg:sticky lg:top-10">
            <CardBody className="flex flex-col gap-1.5">
              <p className="text-body text-ink-soft">Starting price</p>
              <p className="text-h1 text-brass-text">
                {money(service.basePrice)}{' '}
                <span className="text-body text-ink-soft">{priceUnitLabel(service.priceUnit)}</span>
              </p>

              <div className="flex flex-wrap gap-0.5">
                {service.durationOptions.map((d) => (
                  <Badge key={d}>{durationLabel(d)}</Badge>
                ))}
              </div>

              <Link
                to={`/book?service=${service.slug}`}
                className={buttonClasses('primary', 'lg', true)}
              >
                Request {service.name.toLowerCase()}
              </Link>
              <a
                href={telHref()}
                data-analytics="service-detail-call"
                className={buttonClasses('secondary', 'lg', true)}
              >
                Call {brand.contact.phoneDisplay}
              </a>

              <p className="text-small text-ink-soft">
                Staffed by: {service.qualificationRequired}
              </p>
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section tone="tinted" spacing="tight">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-h2">What is included</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {service.inclusions.map((item) => (
                <li key={item} className="flex items-start gap-1 text-body text-ink">
                  <Tick />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {/* Spec 6.3 requires saying plainly what is NOT covered. Publishing
                this is what stops a booking turning into an argument later. */}
            <h2 className="text-h2">What is not</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {service.exclusions.map((item) => (
                <li key={item} className="flex items-start gap-1 text-body text-ink">
                  <Cross />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section spacing="tight">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-h2">Who this suits</h2>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-3">
              {service.suitableFor.map((item) => (
                <li key={item} className="measure text-body text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-h2">What changes the price</h2>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-3">
              {service.priceFactors.map((item) => (
                <li key={item} className="measure text-body text-ink-soft">
                  {item}
                </li>
              ))}
            </ul>
            <p className="measure mt-2 text-body text-ink-soft">
              A coordinator gives you the actual figure before anything is booked, and it does not
              change afterwards without you agreeing to it.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="tinted" spacing="tight">
        <SectionHeading title="Is it available where you are?" />
        <div className="mt-2 max-w-[38rem]">
          <PincodeCheck source="hero_check" />
        </div>
      </Section>

      {service.faqs.length > 0 ? (
        <Section spacing="tight">
          <SectionHeading title="Questions families ask" />
          <Accordion
            className="mt-2"
            headingLevel="h3"
            items={service.faqs.map((f, i) => ({
              id: `faq-${i}`,
              question: f.question,
              answer: <p>{f.answer}</p>,
            }))}
          />
        </Section>
      ) : null}
    </>
  );
}

function Tick() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 size-2.5 shrink-0 text-positive"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 8.5 3.5 3.5L13 5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 size-2.5 shrink-0 text-ink-soft"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}
