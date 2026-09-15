import { brand, launchedCities, telHref } from '@shared/brand.js';
import type { ServiceArea } from '@shared/types/index.js';
import { Skeleton, SkeletonGroup } from '@shared/ui/index.js';
import { PincodeCheck } from '@/components/PincodeCheck.js';
import { PageHero } from '@/components/SkyHero.js';
import { Seo, breadcrumbSchema, medicalBusinessSchema } from '@/components/Seo.js';
import { getAllServiceAreas } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

interface CityGroup {
  slug: string;
  name: string;
  covered: ServiceArea[];
  planned: ServiceArea[];
}

const plural = (n: number) => `${n} ${n === 1 ? 'locality' : 'localities'}`;

export default function Coverage() {
  const { data, loading } = useApi(getAllServiceAreas, []);
  const areas = data ?? [];

  const groups: CityGroup[] = [];
  for (const area of areas) {
    let group = groups.find((g) => g.slug === area.citySlug);
    if (!group) {
      group = { slug: area.citySlug, name: area.city, covered: [], planned: [] };
      groups.push(group);
    }
    (area.isActive ? group.covered : group.planned).push(area);
  }

  const coveredCount = areas.filter((a) => a.isActive).length;
  const cityNames = launchedCities().map((c) => c.name);

  return (
    <>
      <Seo
        title={`Areas we serve - ${brand.name}`}
        description={`Localities and pincodes covered in ${cityNames.join(
          ' and ',
        )}. Check your pincode and see what is available on your street.`}
        path="/coverage"
        structuredData={[
          medicalBusinessSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Areas served', path: '/coverage' },
          ]),
        ]}
      />

      <PageHero
        crumb="Areas served"
        centered
        title="Care, in your part of town"
        intro={`${coveredCount} localities across ${cityNames.join(
          ' and ',
        )} are staffed today. If we cannot cover an address properly, we say so rather than sending someone who will not arrive.`}
      >
        <div className="mt-1.5 w-full max-w-[340px]">
          <PincodeCheck source="coverage_waitlist" variant="sky" />
        </div>

        {/* The city counts are the answer for anyone who has not typed anything
            yet: they say how large "covered" actually is. */}
        <ul className="mt-2.25 flex flex-wrap justify-center gap-1.25">
          {groups.map((g) => (
            <li
              key={g.slug}
              className="flex items-baseline gap-[9px] rounded-pill bg-surface/92 px-2.5 py-1.25 whitespace-nowrap"
            >
              <span className="text-body text-ink">{g.name}</span>
              <span className="text-meta text-pewter-text">{plural(g.covered.length)}</span>
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-[clamp(2rem,4.5vw,3.25rem)] px-(--page-gutter) pt-[clamp(2.25rem,5vw,4rem)] pb-[clamp(3.25rem,7vw,6rem)]">
          {loading ? (
            <SkeletonGroup label="Loading coverage" className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-[14rem]" />
              ))}
            </SkeletonGroup>
          ) : (
            groups.map((group) => <CitySection key={group.slug} group={group} />)
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-feature bg-pewter-lo p-[clamp(1.375rem,3vw,2rem)]">
            <p className="max-w-[50ch] text-body-lg text-ink-soft">
              Outside these areas? We add two or three localities a month. Call and a coordinator
              will tell you honestly whether we can help, and who can if we cannot.
            </p>
            <a
              href={telHref()}
              data-analytics="coverage-call"
              className="btn inline-flex h-6.5 items-center gap-[9px] rounded-pill border border-pewter bg-surface px-3.25 text-body font-medium whitespace-nowrap text-ink no-underline"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-[15px] shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7a1.3 1.3 0 0 1-.2 1.7l-.7.6a8 8 0 0 0 3.4 3.4l.6-.7a1.3 1.3 0 0 1 1.7-.2l1.7 1.2a1.3 1.3 0 0 1 .3 1.8l-.8 1.1a2 2 0 0 1-2.3.7C7.6 12 4 8.4 2.6 4.6a2 2 0 0 1 .7-2.3l.4-.8Z" />
              </svg>
              {brand.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * One city.
 *
 * A plain two-column list of locality and pincode rather than cards: this is a
 * reference table, and someone arrives at it looking for one name. A pincode
 * set in brass is one where only part of the catalogue is staffed, and the note
 * under the list says which.
 */
function CitySection({ group }: { group: CityGroup }) {
  const partial = group.covered.filter((a) => a.serviceSlugs.length > 0);

  return (
    <div className="flex flex-col gap-1.75">
      <div className="flex flex-wrap items-baseline justify-between gap-1.5 border-b border-line pb-1.5">
        <h2 className="text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] tracking-[-.025em]">
          {group.name}
        </h2>
        <span className="text-meta tracking-[.1em] text-pewter-text uppercase">
          {plural(group.covered.length)}
        </span>
      </div>

      <ul className="grid gap-x-2 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
        {group.covered.map((area) => (
          <li
            key={area.id}
            className="flex items-baseline justify-between gap-1.25 border-b border-[rgba(21,26,40,.08)] py-[11px]"
          >
            <span className="text-[.96875rem]">{area.locality}</span>
            <span
              className={
                area.serviceSlugs.length > 0
                  ? 'text-meta tabular-nums text-brass-text'
                  : 'text-meta tabular-nums text-pewter-text'
              }
            >
              {area.pincode}
            </span>
          </li>
        ))}
      </ul>

      {partial.length > 0 ? (
        <p className="text-small text-brass-text">
          {partial.map((a) => a.locality).join(', ')}: a limited set of services so far.
        </p>
      ) : null}

      {group.planned.length > 0 ? (
        <p className="text-small text-pewter-text">
          Not staffed yet: {group.planned.map((a) => a.locality).join(', ')}. Check the pincode
          above and leave a number, and we will call you when that changes.
        </p>
      ) : null}
    </div>
  );
}
