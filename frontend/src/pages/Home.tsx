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

/** Sections resolve to white at both ends, so consecutive bands need no divider. */
const BAND =
  'bg-[linear-gradient(to_bottom,#fff_0%,#f6f8fc_12%,#eaeff8_34%,#e4ebf6_64%,#f4f6fa_88%,#fff_100%)]';

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
      <Pricing />

      <Reveal>
        <CareTeam />
      </Reveal>

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
      <div className="container-page relative flex flex-col items-center pt-[clamp(8rem,18vw,17.875rem)] pb-[clamp(7.75rem,14vw,13rem)]">
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
            You see who is coming, and the rate, before you book.
          </p>

          {/* PincodeCheck carries its own label, so there is no heading here. */}
          <div id="book" className="w-full max-w-[318px] scroll-mt-12.5 text-left">
            <PincodeCheck source="hero_check" variant="sky" />
            <p className="mx-auto mt-1.75 max-w-[34ch] text-center text-meta text-surface/95">
              {activeAreas().length} localities across {cities.join(' and ')}
            </p>
          </div>
        </div>
      </div>
    </SkyHero>
  );
}

/* ---------------------------------------------------------------------- */

function Services() {
  const { data, loading, error, reload } = useApi(getServices, []);

  return (
    <section id="services" className={cn('scroll-mt-12', BAND)}>
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
 * How it works.
 *
 * A list with hairline rules rather than four cards. The steps are sequential
 * and read in order, and a row carries that better than a grid of equals.
 *
 * The numerals are aria-hidden: this is an ordered list, so a screen reader
 * announcing "zero one, one, Tell us what you need" reads the count twice.
 */
function HowItWorks() {
  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-(--page-gutter) section-y">
        <div className="flex max-w-[46ch] flex-col gap-1.25">
          <span className="font-sans text-meta font-semibold tracking-[.18em] text-brass-text uppercase">
            How it works
          </span>
          <h2 className="text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.06] tracking-[-.035em]">
            Four steps, and a named person answerable at each one.
          </h2>
        </div>

        <ol className="mt-[clamp(1.75rem,4vw,3rem)] flex flex-col">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="grid items-baseline gap-1 gap-x-[clamp(1.5rem,4vw,3.5rem)] border-t border-line py-[clamp(1.375rem,3vw,2.125rem)] md:[grid-template-columns:auto_minmax(220px,1fr)_minmax(0,1.1fr)]"
            >
              <span
                aria-hidden="true"
                className="font-display text-[clamp(2.125rem,4vw,3.25rem)] leading-[.9] tracking-[-.04em] tabular-nums text-blue/26"
              >
                {step.n}
              </span>
              <h3 className="text-[clamp(1.25rem,2.1vw,1.5625rem)] leading-[1.16] tracking-[-.02em]">
                {step.title}
              </h3>
              <p className="text-body leading-[1.6] text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
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
 * for it. What belongs here is the thing a table cannot do: let someone set the
 * two variables that actually move a quote and watch the figure respond.
 */
function Pricing() {
  const { data, loading } = useApi(getServices, []);

  return (
    <section id="pricing" className={cn('relative scroll-mt-12 overflow-hidden', BAND)}>
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
                    className="mt-[3px] grid size-[19px] shrink-0 place-items-center rounded-pill bg-blue"
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

function CareTeam() {
  const { data, loading } = useApi(getProfessionals, []);
  const shown = data?.slice(0, 3) ?? [];

  return (
    <section id="team" className="scroll-mt-12 bg-surface">
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

        <div className="mt-[clamp(1.625rem,3.5vw,2.625rem)]">
          {loading ? (
            <SkeletonGroup label="Loading the care team" className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[9rem]" />
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
              <ul className="flex flex-col">
                {shown.map((p) => (
                  <li key={p.id}>
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

const CTA_POINTS = ['No payment upfront', 'No account to create', 'Profile shared before booking'];

/**
 * The closing call to action.
 *
 * The page ends on the same blue it opened with, but travelling the other way:
 * white at the top, deepening to the accent at the base, where the footer picks
 * the same stop up and carries it down to navy. The two are one gradient split
 * across a section boundary.
 */
function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#fff_0%,#fbfcfe_8%,#f4f7fc_17%,#eaf0f9_27%,#dde7f5_38%,#ccdbef_49%,#b8cbe8_59%,#a1b8de_68%,#89a4d3_76%,#7090c6_83%,#5878b8_89%,#436aac_95%,var(--color-accent)_100%)]"
      />

      <div className="relative mx-auto flex w-full max-w-[760px] flex-col items-center gap-[clamp(1rem,2vw,1.375rem)] px-(--page-gutter) pt-[clamp(4.5rem,10vw,8rem)] pb-[clamp(5rem,11vw,8.75rem)] text-center">
        <span className="font-sans text-meta font-semibold tracking-[.18em] text-brass-text uppercase">
          Ready when you are
        </span>

        <h2 className="max-w-[20ch] text-display">
          Tell us who needs care, and we will take it from there.
        </h2>

        <p className="max-w-[52ch] text-[clamp(1rem,1.5vw,1.125rem)] leading-[1.55] text-ink-soft">
          Four short questions, or one phone call. A coordinator calls back
          {brand.callbackMinutes ? ` within ${brand.callbackMinutes} minutes` : ' shortly'} with a
          named professional and a firm rate.
        </p>

        <div className="mt-0.75 flex flex-wrap items-start justify-center gap-x-1.5 gap-y-1.75">
          <Link
            to="/book"
            className="ctarow inline-flex h-7.75 items-center gap-2 rounded-pill bg-surface pr-1 pl-3.75 text-[1.09375rem] font-medium tracking-[-.005em] text-blue-deep no-underline shadow-[0_18px_40px_-20px_rgba(13,47,125,.45),inset_0_0_0_1px_rgba(13,47,125,.08)]"
          >
            Request care
            <span
              aria-hidden="true"
              className="grid size-5.75 shrink-0 place-items-center rounded-pill bg-blue"
            >
              <svg
                viewBox="0 0 20 20"
                className="ctaarrow size-2.25"
                fill="none"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.17 10h11.66M15.83 10 10 4.17M15.83 10 10 15.83" />
              </svg>
            </span>
          </Link>

          <div className="flex flex-col items-center gap-1.25">
            <a
              href={telHref()}
              data-analytics="closing-cta-call"
              className="ctarow inline-flex h-6.75 items-center gap-1.25 rounded-pill border border-[rgba(13,47,125,.32)] bg-transparent px-3.25 text-[1.03125rem] font-medium text-blue-deep no-underline"
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
            <p className="text-small text-pewter-text">Answered 24 hours, by a coordinator</p>
          </div>
        </div>

        <ul className="mt-[clamp(1.5rem,3.5vw,2.375rem)] flex flex-wrap justify-center gap-x-3.75 gap-y-1.5 border-t border-[rgba(16,20,31,.14)] pt-2.5">
          {CTA_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-1 text-small text-pewter-text">
              <svg
                viewBox="0 0 24 24"
                className="size-[15px] shrink-0"
                fill="none"
                stroke="var(--color-accent-deep)"
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
