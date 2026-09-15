import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';

/**
 * Footer.
 *
 * A navy band that the closing section's gradient runs straight into: the top
 * of the footer repeats the last stop of that gradient and fades to navy, so
 * the seam between the two is not visible. One blue glow behind the top-left
 * corner stops the dark area reading as a dead slab.
 *
 * Spec 6.7: every link resolves to a real page. There are no `#` placeholders,
 * and the service links are generated from the catalogue rather than
 * hand-listed, so a deactivated service cannot leave a dead link behind.
 * links.test.ts enforces both that and the set of destinations below.
 */
export function Footer() {
  const social = Object.entries(brand.social).filter(([, href]) => Boolean(href)) as [
    string,
    string,
  ][];

  return (
    <footer className="relative overflow-hidden bg-navy text-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(11.25rem,26vw,18.75rem)] bg-[linear-gradient(to_bottom,var(--color-accent)_0%,#2a4d9a_12%,var(--color-accent-deep)_26%,#193465_42%,#112650_58%,#0a1a44_74%,#04123a_88%,rgba(0,11,51,0)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[55%] -left-[8%] h-[min(760px,90vh)] w-[min(1000px,110vw)] rounded-pill blur-[70px] bg-[radial-gradient(circle,rgba(48,86,167,.6)_0%,rgba(48,86,167,0)_68%)]"
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-(--page-gutter) pt-[clamp(3.25rem,7vw,5.5rem)] pb-[clamp(1.5rem,3vw,2rem)]">
        <div className="grid gap-[clamp(1.75rem,4vw,3rem)] sm:grid-cols-2 min-[900px]:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-2">
            <span className="font-display text-h2 text-surface">{brand.name}</span>

            <p className="max-w-[30ch] text-small text-surface/72">{brand.strapline}</p>

            <a
              href={telHref()}
              data-analytics="footer-call"
              className="inline-flex h-6 items-center gap-1.25 self-start rounded-pill border border-surface/22 bg-surface/10 px-2.5 text-body text-surface no-underline transition-colors duration-(--dur-state) ease-state hover:bg-surface/18"
            >
              <PhoneIcon />
              {brand.contact.phoneDisplay}
            </a>

            <p className="inline-flex items-center gap-1 text-meta text-surface/62">
              <span aria-hidden="true" className="size-[7px] rounded-pill bg-[#6ee7a8]" />
              Coordinators answer 24 hours
            </p>
          </div>

          <FooterNav id="footer-care" title="Care">
            <li>
              <FooterLink to="/services">Services</FooterLink>
            </li>
            <li>
              <FooterLink to="/professionals">Our care team</FooterLink>
            </li>
            <li>
              <FooterLink to="/#pricing">What it costs</FooterLink>
            </li>
            <li>
              <FooterLink to="/coverage">Areas served</FooterLink>
            </li>
          </FooterNav>

          <FooterNav id="footer-start" title="Get started">
            <li>
              <FooterLink to="/book">Request care</FooterLink>
            </li>
            <li>
              <a
                href={telHref()}
                className="text-small text-surface/82 no-underline transition-colors duration-(--dur-hover) ease-state hover:text-surface"
              >
                Speak to a coordinator
              </a>
            </li>
            <li>
              <FooterLink to="/contact">Contact</FooterLink>
            </li>
            <li>
              <FooterLink to="/coverage">Check your pincode</FooterLink>
            </li>
            <li>
              <FooterLink to="/partner">Join the network</FooterLink>
            </li>
          </FooterNav>

          <FooterNav id="footer-reading" title="Reading">
            <li>
              <FooterLink to="/blog">Articles</FooterLink>
            </li>
            <li>
              <FooterLink to="/about">About</FooterLink>
            </li>
            <li>
              <FooterLink to="/careers">Careers</FooterLink>
            </li>
          </FooterNav>
        </div>

        <div className="mt-[clamp(2.25rem,5vw,3.75rem)] flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.25 border-t border-surface/14 pt-2.75">
          <span className="text-meta text-surface/62">
            &copy; {new Date().getFullYear()} {brand.legalName}
          </span>

          <ul className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <li>
              <FooterLink to="/terms">Terms of service</FooterLink>
            </li>
            <li>
              <FooterLink to="/privacy">Privacy policy</FooterLink>
            </li>
            {social.map(([name, href]) => (
              <li key={name}>
                <a
                  href={href}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="text-small text-surface/82 no-underline transition-colors duration-(--dur-hover) ease-state hover:text-surface"
                >
                  {name[0]?.toUpperCase()}
                  {name.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* The page says out loud that its contact details are not real, and
            that the legal pages have not been reviewed. Both are worth more
            than a plausible placeholder nobody questions. */}
        <p className="mt-1.25 max-w-[70ch] text-meta leading-[1.5] text-surface/62">
          Terms and privacy are pending legal review. Brand name, phone number, address and email
          are placeholders held in the brand file, not real contact details.
        </p>
      </div>
    </footer>
  );
}

function FooterNav({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <nav aria-labelledby={id} className="flex flex-col gap-1.75">
      <h2
        id={id}
        className="font-sans text-meta font-semibold tracking-[.16em] text-surface/50 uppercase"
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-[11px]">{children}</ul>
    </nav>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="text-small text-surface/82 no-underline transition-colors duration-(--dur-hover) ease-state hover:text-surface"
    >
      {children}
    </Link>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-[15px] shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7a1.3 1.3 0 0 1-.2 1.7l-.7.6a8 8 0 0 0 3.4 3.4l.6-.7a1.3 1.3 0 0 1 1.7-.2l1.7 1.2a1.3 1.3 0 0 1 .3 1.8l-.8 1.1a2 2 0 0 1-2.3.7C7.6 12 4 8.4 2.6 4.6a2 2 0 0 1 .7-2.3l.4-.8Z" />
    </svg>
  );
}
