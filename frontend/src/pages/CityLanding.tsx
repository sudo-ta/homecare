import { Link } from 'react-router';
import { brand, getCity, telHref } from '@shared/brand.js';
import { Card, CardBody, Skeleton, SkeletonGroup, buttonClasses } from '@shared/ui/index.js';
import { PincodeCheck } from '@/components/PincodeCheck.js';
import { ProfessionalCard } from '@/components/ProfessionalCard.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema, serviceSchema } from '@/components/Seo.js';
import { ServiceCard } from '@/components/ServiceCard.js';
import { getAllServiceAreas, getProfessionals, getServices } from '@/lib/api.js';
import { money, priceUnitLabel } from '@/lib/format.js';
import { useApi } from '@/lib/useApi.js';
import NotFound from './NotFound.js';

/**
 * The city-and-service landing pattern from spec 9.
 *
 * One route per launched city, generated from brand.cities, so adding a city is
 * a data change rather than a new page. Each carries its own LocalBusiness
 * schema, its own localities, and the professionals who actually work there -
 * which is what makes it a real page rather than the same copy with a city
 * name swapped in, the thing search engines and readers both punish.
 */
export default function CityLanding({ citySlug }: { citySlug: string }) {
  const city = getCity(citySlug);
  const { data: services, loading: servicesLoading } = useApi(getServices, []);
  const { data: areas } = useApi(getAllServiceAreas, []);
  const { data: pros } = useApi(getProfessionals, []);

  if (!city) return <NotFound />;

  const cityAreas = (areas ?? []).filter((a) => a.citySlug === citySlug && a.isActive);
  const cityPros = (pros ?? []).filter((p) => p.citySlug === citySlug).slice(0, 3);
  const nursing = services?.find((s) => s.slug === 'home-nursing');

  return (
    <>
      <Seo
        title={`Home nursing in ${city.name} - ${brand.name}`}
        description={`Qualified nurses, caregivers and physiotherapists at home across ${city.name}. ${cityAreas.length} localities covered. Starting prices published.`}
        path={`/home-nursing-${city.slug}`}
        structuredData={[
          medicalBusinessSchema(city.slug),
          ...(nursing
            ? [
                serviceSchema({
                  name: `Home nursing in ${city.name}`,
                  description: nursing.summary,
                  slug: nursing.slug,
                  price: nursing.basePrice,
                  priceUnit: priceUnitLabel(nursing.priceUnit),
                }),
              ]
            : []),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: `Home nursing in ${city.name}`, path: `/home-nursing-${city.slug}` },
          ]),
        ]}
      />

      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-midnight-lo to-paper" />
        <div className="container-page relative section-y">
          <div className="measure flex flex-col gap-2">
            <h1 className="text-h1">Home nursing in {city.name}</h1>
            <p className="text-body-lg text-ink-soft">
              Nurses, caregivers, physiotherapists and doctors who come to your house across{' '}
              {city.name}. You see who is coming, and what it costs, before you book.
            </p>
            <div className="mt-1">
              <PincodeCheck source="hero_check" />
            </div>
            <p className="text-small text-ink-soft">
              Would rather talk to someone?{' '}
              <a
                href={telHref()}
                data-analytics="city-hero-call"
                className="font-medium text-ink underline underline-offset-2"
              >
                Call {brand.contact.phoneDisplay}
              </a>
            </p>
          </div>
        </div>
      </section>

      <Section spacing="tight">
        <SectionHeading
          title={`Where we reach in ${city.name}`}
          intro={`${cityAreas.length} localities, with the pincode for each. Enter yours above to see the exact service list for your street.`}
          aside={
            <Link to="/coverage" className={buttonClasses('secondary', 'md')}>
              Every area we serve
            </Link>
          }
        />
        {cityAreas.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1">
            {cityAreas.map((a) => (
              <li
                key={a.id}
                className="rounded-pill border border-line bg-surface px-1.5 py-0.5 text-small text-ink"
              >
                {a.locality} <span className="font-mono text-ink-soft">{a.pincode}</span>
              </li>
            ))}
          </ul>
        ) : (
          <SkeletonGroup label="Loading localities" className="mt-3 flex flex-wrap gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-[9rem] rounded-pill" />
            ))}
          </SkeletonGroup>
        )}
      </Section>

      <Section tone="tinted" spacing="tight">
        <SectionHeading title={`What we do in ${city.name}`} />
        <div className="mt-3">
          {servicesLoading ? (
            <SkeletonGroup label="Loading services" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} shape="card" className="h-[16rem]" />
              ))}
            </SkeletonGroup>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(services ?? []).slice(0, 8).map((s) => (
                <li key={s.slug}>
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {cityPros.length > 0 ? (
        <Section spacing="tight">
          <SectionHeading
            title={`Professionals working in ${city.name}`}
            aside={
              <Link to="/professionals" className={buttonClasses('secondary', 'md')}>
                See the whole team
              </Link>
            }
          />
          <ul className="mt-3 grid gap-2 md:grid-cols-3">
            {cityPros.map((p) => (
              <li key={p.id}>
                <ProfessionalCard professional={p} showChecks />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {services && services.length > 0 ? (
        <Section tone="tinted" spacing="tight">
          <SectionHeading title={`What it costs in ${city.name}`} />
          <Card className="mt-3">
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-left">
                  <caption className="sr-only">
                    Indicative starting prices in {city.name}
                  </caption>
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-1.5 pr-2 text-small font-semibold">
                        Service
                      </th>
                      <th scope="col" className="py-1.5 pr-2 text-small font-semibold">
                        Charged
                      </th>
                      <th scope="col" className="py-1.5 text-right text-small font-semibold">
                        From
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.slug} className="border-b border-line last:border-0">
                        <th scope="row" className="py-1.5 pr-2 text-body font-normal">
                          <Link
                            to={`/services/${s.slug}`}
                            className="text-ink underline underline-offset-2"
                          >
                            {s.name}
                          </Link>
                        </th>
                        <td className="py-1.5 pr-2 text-body text-ink-soft">
                          {priceUnitLabel(s.priceUnit)}
                        </td>
                        <td className="py-1.5 text-right text-body font-semibold text-ink">
                          {money(s.basePrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Section>
      ) : null}

      <section className="border-t border-line bg-ink">
        <div className="container-page section-y">
          <div className="measure flex flex-col gap-2">
            <h2 className="text-h1 text-paper">Arrange care in {city.name}</h2>
            <p className="text-body-lg text-midnight-lo">
              Tell us what you need and a coordinator calls you back
              {brand.callbackMinutes ? ` within ${brand.callbackMinutes} minutes` : ' shortly'}.
            </p>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row">
              <Link
                to="/book"
                className={buttonClasses('primary-on-dark', 'lg')}
              >
                Request care
              </Link>
              <a
                href={telHref()}
                data-analytics="city-cta-call"
                className={buttonClasses('secondary-on-dark', 'lg')}
              >
                Call {brand.contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
