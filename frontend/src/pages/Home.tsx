import { Link } from 'react-router';
import { brand, launchedCities, telHref } from '@shared/brand.js';
import {
  Alert,
  Button,
  EmptyState,
  Skeleton,
  SkeletonGroup,
  buttonClasses,
} from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import { PincodeCheck } from '@/components/PincodeCheck.js';
import { PriceEstimator } from '@/components/PriceEstimator.js';
import { Reveal } from '@/components/Reveal.js';
import { SectionHeading } from '@/components/Section.js';
import { ServiceCard } from '@/components/ServiceCard.js';
import { Seo } from '@/components/Seo.js';
import { SkyHero } from '@/components/SkyHero.js';
import { TeamCard } from '@/components/TeamCard.js';
import { activeAreas } from '@/content/serviceAreas.js';
import { getProfessionals, getServices } from '@/lib/api.js';
import { useFirstVisitThisSession } from '@/lib/motion.js';
import { useApi } from '@/lib/useApi.js';

export default function Home() {
  return (
    <>
      <Seo
        title={`${brand.name} - nurses and caregivers at home`}
        description={`${brand.strapline} Check whether we cover your pincode, see what each service costs, and meet the people who would come.`}
        path="/"
      />

      <Hero />

      {/* Exactly three entrance reveals, and only on this page. */}
      <Reveal>
        <Services />
      </Reveal>

      <HowItWorks />

      <Reveal>
        <CareTeam />
      </Reveal>

      <Pricing />
      <Coverage />

      <Reveal>
        <ClosingCta />
      </Reveal>
    </>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The hero: centred white type over the gradient, with the coverage check as
 * the only interactive thing in it.
 *
 * The headline reveal runs once per session. Nothing touches the pincode field:
 * it renders in its final state and is interactive on first paint, because the
 * entire point of this page is that a worried person can check their area
 * immediately.
 *
 * The section pulls itself up under the floating header and pads the space
 * back, so the gradient runs behind the glass rather than starting below it.
 */
function Hero() {
  const reveal = useFirstVisitThisSession('hero-revealed');
  const motion = reveal ? 'hero' : undefined;
  const cities = launchedCities().map((c) => c.name);

  return (
    <SkyHero className="-mt-11.5 pt-11.5">
      <div className="container-page relative flex flex-col items-center pt-[clamp(4.5rem,12vw,10.5rem)] pb-[clamp(7.5rem,14vw,12.25rem)]">
        <div className="flex w-full max-w-[780px] flex-col items-center gap-[clamp(1.125rem,2.4vw,1.75rem)] text-center">
          <h1 className="text-display text-surface">
            <span className="block overflow-hidden" data-motion={motion}>
              <span className="block">Care at home, from people</span>
            </span>
            <span className="block overflow-hidden" data-motion={motion}>
              <span className="block" style={reveal ? { animationDelay: '90ms' } : undefined}>
                you have already met.
              </span>
            </span>
          </h1>

          <p
            className="max-w-[58ch] text-body-lg text-surface"
            data-motion={reveal ? 'row' : undefined}
            style={
              reveal
                ? {
                    animationDelay: '420ms',
                    animationDuration: 'var(--dur-reveal)',
                    animationTimingFunction: 'var(--ease-signature)',
                    ['--row-rise' as string]: '8px',
                  }
                : undefined
            }
          >
            Nurses, caregivers, physiotherapists and doctors who come to your house. You see who is
            coming, and what it costs, before you book.
          </p>

          {/* PincodeCheck carries its own <label for>, so there is no heading
              here: a second one would be unassociated and read twice. */}
          <div id="book" className="w-full max-w-[560px] scroll-mt-12.5 text-left">
            <PincodeCheck source="hero_check" variant="sky" />
            <p className="mt-1.75 text-center text-meta text-surface/95">
              {activeAreas().length} localities across {cities.join(' and ')}. Try 380009, 382350 or
              390007.
            </p>
          </div>
        </div>
      </div>
    </SkyHero>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The tinted band gradients.
 *
 * Each section resolves to white at both ends, so consecutive bands need no
 * divider between them - there is no seam to hide. The blue is far enough
 * down the tint that the glass cards sitting on it still read as lighter than
 * their ground, which is what makes them look lit rather than pasted on.
 */
const BAND_SERVICES =
  'bg-[linear-gradient(to_bottom,#fff_0%,#f6f8fc_12%,#eaeff8_34%,#e4ebf6_64%,#f4f6fa_88%,#fff_100%)]';
const BAND_STEPS =
  'bg-[linear-gradient(to_bottom,#fff_0%,#e9eff8_30%,#e3ebf6_62%,#f2f5fa_88%,#fff_100%)]';
const BAND_TEAM =
  'bg-[linear-gradient(to_bottom,#fff_0%,#e9eff8_24%,#e3ebf6_58%,#f0f4fa_86%,#fff_100%)]';

function Services() {
  const { data, loading, error, reload } = useApi(getServices, []);

  return (
    <section id="services" className={cn('scroll-mt-12', BAND_SERVICES)}>
      <div className="container-page section-y">
        <SectionHeading
          title="What we do"
          intro="Every service is staffed by someone qualified for it, and priced before you commit."
          aside={
            <Link to="/services" className={buttonClasses('secondary', 'md')}>
              Compare all services
            </Link>
          }
        />

        <div className="mt-3.5">
          {loading ? (
            <SkeletonGroup
              label="Loading services"
              className="grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(262px,1fr))]"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} shape="feature" className="h-[19rem]" />
              ))}
            </SkeletonGroup>
          ) : error ? (
            <Alert
              tone="critical"
              title="We could not load the service list"
              live
              action={
                <Button variant="secondary" onClick={reload}>
                  Try again
                </Button>
              }
            >
              <p>
                That is a problem at our end, not yours. You can still call{' '}
                <a
                  href={telHref()}
                  className="font-medium text-midnight underline underline-offset-2"
                >
                  {brand.contact.phoneDisplay}
                </a>
                .
              </p>
            </Alert>
          ) : !data || data.length === 0 ? (
            <EmptyState
              title="The service list is being updated"
              action={
                <a href={telHref()} className={buttonClasses('primary', 'md')}>
                  Call {brand.contact.phoneDisplay}
                </a>
              }
            >
              Nothing is listed here right now. Call us and a coordinator will tell you what is
              available in your area today.
            </EmptyState>
          ) : (
            <ul className="grid items-stretch gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(262px,1fr))]">
              {data.map((s) => (
                <li key={s.slug} className="flex h-full">
                  <ServiceCard service={s} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

const STEPS = [
  {
    n: '01',
    title: 'Tell us what you need',
    body: 'A short form, or a phone call if you would rather. A coordinator calls you back to understand the case properly.',
  },
  {
    n: '02',
    title: 'We match a professional and send you their profile',
    body: 'You see their name, qualification, experience and what we verified, before they are booked.',
  },
  {
    n: '03',
    title: 'Care begins at home',
    body: 'They arrive at the agreed time with the instructions from the discharge summary or the doctor already in hand.',
  },
  {
    n: '04',
    title: 'A coordinator stays with the booking',
    body: 'One person you can call, who arranges cover if the professional is unwell and changes the assignment if it is not working.',
  },
];

/**
 * The numerals are set large in the display face and in the accent, which is
 * the one place a number is decoration rather than data. They are aria-hidden
 * because the list is already an ordered list: a screen reader announcing
 * "zero one, one, Tell us what you need" reads the count twice.
 */
function HowItWorks() {
  return (
    <section className={BAND_STEPS}>
      <div className="container-page section-y">
        <div className="flex max-w-[56ch] flex-col gap-1.25">
          <h2 className="text-h2">How it works</h2>
          <p className="text-body-lg text-ink-soft">
            Four steps, and a named person answerable at each one.
          </p>
        </div>

        <ol className="mt-[clamp(1.625rem,3.5vw,2.5rem)] grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(248px,1fr))]">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex flex-col gap-1.75 rounded-feature border border-[rgba(255,255,255,.85)] bg-[rgba(255,255,255,.62)] px-3 pt-3.25 pb-3.5 shadow-[0_26px_56px_-34px_rgba(16,20,31,.4),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-[22px] backdrop-saturate-[180%]"
            >
              <span
                aria-hidden="true"
                className="font-display text-[2.75rem] leading-[.9] tracking-[-.04em] text-accent"
              >
                {step.n}
              </span>
              <span aria-hidden="true" className="h-px bg-[rgba(21,26,40,.14)]" />
              <h3 className="text-h3">{step.title}</h3>
              <p className="text-small text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

function CareTeam() {
  const { data, loading } = useApi(getProfessionals, []);
  const shown = data?.slice(0, 3) ?? [];

  return (
    <section id="team" className={cn('scroll-mt-12', BAND_TEAM)}>
      <div className="container-page section-y">
        <SectionHeading
          title="The people who would come"
          intro="You are deciding whether to let a stranger into your house. These are the checks we run before anyone reaches a patient."
          aside={
            <Link to="/professionals" className={buttonClasses('secondary', 'md')}>
              See the whole team
            </Link>
          }
        />

        <div className="mt-[clamp(1.625rem,3.5vw,2.5rem)]">
          {loading ? (
            <SkeletonGroup
              label="Loading the care team"
              className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} shape="feature" className="h-[26rem]" />
              ))}
            </SkeletonGroup>
          ) : shown.length === 0 ? (
            <EmptyState
              title="Profiles are being published"
              action={
                <Link to="/partner" className={buttonClasses('secondary', 'md')}>
                  Join the network
                </Link>
              }
            >
              We are not showing profiles here until every person on the page has agreed to appear.
              Call a coordinator and we will tell you exactly who would be assigned to your booking.
            </EmptyState>
          ) : (
            <>
              <ul className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                {shown.map((p) => (
                  <li key={p.id} className="flex">
                    <TeamCard professional={p} />
                  </li>
                ))}
              </ul>
              <p className="measure mt-2.5 text-meta text-pewter-text">
                Placeholder people. These are served only while the demo content flag is on, so the
                layout and the verification badge can be reviewed before real, consented
                professionals exist.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

const INCLUDED = [
  'A named professional, profile sent before the visit',
  'Registration, ID and police verification checked',
  'One coordinator for the whole booking',
  'A replacement at our cost if they cannot come',
  'No booking fee and no payment upfront',
];

/**
 * What it costs.
 *
 * The full comparison table lives on /services, where a column has the width
 * for it. What belongs on the home page is the thing a table cannot do: let
 * someone set the two variables that actually move a quote and watch the
 * figure respond.
 *
 * The section is painted by a radial that rises from the bottom edge, so the
 * estimator sits in the light part and the blue is behind the fold of the
 * block rather than under the numbers.
 */
function Pricing() {
  const { data, loading } = useApi(getServices, []);

  return (
    <section id="pricing" className="relative scroll-mt-12 overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#fff_0%,#fff_30%,rgba(255,255,255,.9)_44%,rgba(255,255,255,.5)_58%,rgba(255,255,255,0)_72%,rgba(255,255,255,0)_84%,rgba(255,255,255,.55)_93%,#fff_100%),radial-gradient(128%_104%_at_50%_104%,#fff_30%,#93adda_66%,var(--color-accent)_96%)]"
      />

      <div className="relative container-page section-y">
        <div className="grid items-center gap-[clamp(1.5rem,4vw,3.5rem)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          <div className="flex flex-col gap-1.75">
            <h2 className="text-h2">What it costs</h2>
            <p className="max-w-[42ch] text-body-lg text-ink-soft">
              Starting prices, published. Set what moves a quote and see the figure change.
            </p>

            <h3 className="mt-1.25 font-sans text-meta font-semibold tracking-[.12em] text-pewter-text uppercase">
              In every booking
            </h3>
            <ul className="flex flex-col gap-[9px]">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span
                    aria-hidden="true"
                    className="mt-[3px] grid size-[19px] shrink-0 place-items-center rounded-pill bg-accent"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-1.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-small text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {loading ? (
            <SkeletonGroup label="Loading prices" className="flex flex-col gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </SkeletonGroup>
          ) : !data || data.length === 0 ? (
            <EmptyState title="Prices are being updated">
              Call a coordinator for a quote on the service you need.
            </EmptyState>
          ) : (
            <PriceEstimator services={data} />
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

/**
 * The coverage panel.
 *
 * A gradient rounded at the top only, so it reads as rising out of the page
 * rather than sitting on it. The city pills carry a real count each, taken from
 * the coverage data rather than written down, so a locality added to the
 * catalogue changes this number without anyone editing the page.
 */
function Coverage() {
  const areas = activeAreas();
  const cities = launchedCities();

  const counts = cities.map((c) => {
    const n = areas.filter((a) => a.citySlug === c.slug).length;
    return { slug: c.slug, name: c.name, label: `${n} ${n === 1 ? 'locality' : 'localities'}` };
  });

  return (
    <section id="coverage" className="scroll-mt-12 bg-surface">
      <div className="container-page pt-[clamp(3rem,6vw,5rem)]">
        <div className="relative overflow-hidden rounded-t-media bg-[linear-gradient(to_bottom,var(--color-sky-1)_0%,var(--color-sky-2)_46%,#3d5da3_72%,var(--color-sky-4)_86%,#a9c0e2_95%,#fff_100%)]">
          <div className="relative flex flex-col items-center gap-2.25 px-[clamp(1.25rem,5vw,3rem)] pt-[clamp(3.5rem,9vw,7.25rem)] pb-[clamp(4.5rem,11vw,9.25rem)] text-center">
            <h2 className="max-w-[22ch] text-h1 text-surface">Care, in your part of town</h2>

            <p className="max-w-[62ch] text-body-lg text-surface">
              {areas.length} localities across {cities.map((c) => c.name).join(' and ')} are staffed
              today. If we cannot cover an address properly, we say so rather than sending someone
              who will not arrive.
            </p>

            <Link
              to="/coverage"
              className={cn(
                buttonClasses('primary', 'lg'),
                'mt-1 gap-1.25 bg-surface text-midnight hover:bg-midnight-lo',
              )}
            >
              Check your pincode
              <svg
                viewBox="0 0 24 24"
                className="size-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <ul className="mt-2.25 flex flex-wrap justify-center gap-1.25">
              {counts.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-baseline gap-[9px] rounded-pill bg-surface/92 px-2.5 py-1.25 whitespace-nowrap"
                >
                  <span className="text-small text-ink">{c.name}</span>
                  <span className="text-meta text-pewter-text">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */

const CTA_POINTS = [
  'No payment upfront',
  'No account to create',
  'Profile shared before booking',
];

/**
 * The closing call to action.
 *
 * Light rather than the dark band the previous revision used. The blue rises
 * from the bottom of the viewport and the type sits in the white above it, so
 * the page ends on the same gradient it opened with instead of on a slab.
 */
function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_130%_at_50%_118%,#fff_32%,#a9c0e2_68%,var(--color-accent)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-[linear-gradient(to_bottom,#fff_0%,rgba(255,255,255,.7)_46%,rgba(255,255,255,0)_100%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[820px] flex-col items-center gap-[clamp(1rem,2vw,1.375rem)] px-(--page-gutter) pt-[clamp(4.5rem,10vw,8rem)] pb-[clamp(5rem,11vw,8.75rem)] text-center">
        <span className="font-sans text-meta font-semibold tracking-[.18em] text-brass-text uppercase">
          Ready when you are
        </span>

        <h2 className="max-w-[20ch] text-display">
          Tell us who needs care, and we will take it from there.
        </h2>

        <p className="max-w-[52ch] text-body-lg text-ink-soft">
          Four short questions, or one phone call. A coordinator calls back
          {brand.callbackMinutes ? ` within ${brand.callbackMinutes} minutes` : ' shortly'} with a
          named professional and a firm rate.
        </p>

        <div className="mt-0.75 flex flex-col items-center gap-1.75">
          <Link
            to="/book"
            className="ctarow inline-flex h-7.5 items-center gap-[11px] rounded-pill bg-[linear-gradient(to_top,var(--color-accent-deep),var(--color-accent))] px-4.25 text-body font-medium text-surface no-underline shadow-[0_18px_40px_-18px_rgba(48,86,167,.95)]"
          >
            Request care
            <svg
              viewBox="0 0 20 20"
              className="ctaarrow size-[19px] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.17 10h11.66M15.83 10 10 4.17M15.83 10 10 15.83" />
            </svg>
          </Link>

          <p className="text-small text-ink-soft">
            or call{' '}
            <a
              href={telHref()}
              data-analytics="closing-cta-call"
              className="font-medium text-ink underline underline-offset-[3px]"
            >
              {brand.contact.phoneDisplay}
            </a>
            , answered 24 hours
          </p>
        </div>

        <ul className="mt-[clamp(1.125rem,3vw,1.875rem)] flex flex-wrap justify-center gap-x-3.5 gap-y-1.25">
          {CTA_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-1 text-small text-pewter-text">
              <svg
                viewBox="0 0 24 24"
                className="size-[15px] shrink-0"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
