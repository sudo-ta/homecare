import { brand } from '@shared/brand.js';
import type { ServiceArea } from '@shared/types/index.js';
import { Badge, Card, CardBody, Skeleton, SkeletonGroup } from '@shared/ui/index.js';
import { PincodeCheck } from '@/components/PincodeCheck.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema } from '@/components/Seo.js';
import { getAllServiceAreas } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

export default function Coverage() {
  const { data, loading } = useApi(getAllServiceAreas, []);

  const byCity = new Map<string, { name: string; covered: ServiceArea[]; planned: ServiceArea[] }>();
  for (const area of data ?? []) {
    const entry = byCity.get(area.citySlug) ?? { name: area.city, covered: [], planned: [] };
    (area.isActive ? entry.covered : entry.planned).push(area);
    byCity.set(area.citySlug, entry);
  }

  return (
    <>
      <Seo
        title={`Areas we serve - ${brand.name}`}
        description={`Localities and pincodes covered in ${brand.cities
          .filter((c) => c.isLaunched)
          .map((c) => c.name)
          .join(' and ')}. Check your pincode and see what is available on your street.`}
        path="/coverage"
        structuredData={[
          medicalBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Areas served', path: '/coverage' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">Where we work</span>}
          intro="Check a pincode and we will tell you exactly what is available there. Areas we do not reach yet are listed too, because a wrong yes is worse than an honest no."
        />
        <div className="mt-3 max-w-[38rem]">
          <PincodeCheck source="coverage_waitlist" />
        </div>
      </Section>

      <Section spacing="tight" className="!pt-0">
        {loading ? (
          <SkeletonGroup label="Loading coverage" className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} shape="card" className="h-[14rem]" />
            ))}
          </SkeletonGroup>
        ) : (
          <div className="flex flex-col gap-4">
            {[...byCity.entries()].map(([slug, city]) => (
              <div key={slug}>
                <h2 className="text-h2">{city.name}</h2>

                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <Card>
                    <CardBody className="flex flex-col gap-1.5">
                      <h3 className="text-h3">Covered now</h3>
                      <ul className="flex flex-col gap-1">
                        {city.covered.map((a) => (
                          <li
                            key={a.id}
                            className="flex items-center justify-between gap-1 border-b border-line pb-1 last:border-0 last:pb-0"
                          >
                            <span className="text-body text-ink">{a.locality}</span>
                            <span className="flex items-center gap-1">
                              <span className="font-mono text-small text-ink-soft">{a.pincode}</span>
                              {a.serviceSlugs.length > 0 ? (
                                <Badge tone="attention">Some services</Badge>
                              ) : (
                                <Badge tone="positive">All services</Badge>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-small text-ink-soft">
                        &ldquo;Some services&rdquo; means we staff nursing and caregiving there but
                        not yet everything. Check the pincode above to see the exact list.
                      </p>
                    </CardBody>
                  </Card>

                  {city.planned.length > 0 ? (
                    <Card variant="tinted">
                      <CardBody className="flex flex-col gap-1.5">
                        <h3 className="text-h3">Not yet covered</h3>
                        <ul className="flex flex-col gap-1">
                          {city.planned.map((a) => (
                            <li
                              key={a.id}
                              className="flex items-center justify-between gap-1 border-b border-line pb-1 last:border-0 last:pb-0"
                            >
                              <span className="text-body text-ink">{a.locality}</span>
                              <span className="font-mono text-small text-ink-soft">{a.pincode}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-small text-ink-soft">
                          We do not have staff in these areas yet. Enter the pincode above and leave
                          a number, and we will call you when that changes.
                        </p>
                      </CardBody>
                    </Card>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
