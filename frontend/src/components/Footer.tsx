import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { brand, launchedCities, telHref } from '@shared/brand.js';
import { activeServices } from '@/content/services.js';

/**
 * Footer.
 *
 * A navy band with a single blue glow behind the top-left corner, which is what
 * stops a large dark area reading as a dead slab. Everything else in it is
 * type.
 *
 * Spec 6.7: every link resolves to a real page. There are no `#` anchors here,
 * and the service and city links are generated from the catalogue and the brand
 * file rather than hand-listed, so a service that is deactivated or a city that
 * has not launched cannot leave a dead link behind. links.test.ts enforces it.
 */
export function Footer() {
  const services = activeServices().slice(0, 6);
  const cities = launchedCities();
  const social = Object.entries(brand.social).filter(([, href]) => Boolean(href)) as [
    string,
    string,
  ][];

  return (
    <footer className="relative overflow-hidden bg-navy text-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[55%] -left-[8%] h-[min(760px,90vh)] w-[min(1000px,110vw)] rounded-pill blur-[70px] bg-[radial-gradient(circle,rgba(48,86,167,.6)_0%,rgba(48,86,167,0)_68%)]"
      />

      <div className="relative container-page pt-[clamp(3.25rem,7vw,5.5rem)] pb-[clamp(1.5rem,3vw,2rem)]">
        <div className="grid gap-[clamp(1.75rem,4vw,3rem)] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {/* --- the brand column ------------------------------------------ */}
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

            <p className="inline-flex items-center gap-1 text-meta text-surface/60">
              {/* Positive, not accent: this is a status, and the one green dot
                  on the page should not be mistaken for a brand colour. */}
              <span aria-hidden="true" className="size-[7px] rounded-pill bg-[#6ee7a8]" />
              Coordinators answer 24 hours
            </p>
          </div>

          <FooterNav id="footer-services" title="Services">
            {services.map((s) => (
              <li key={s.slug}>
                <FooterLink to={`/services/${s.slug}`}>{s.name}</FooterLink>
              </li>
            ))}
            <li>
              <FooterLink to="/services">All services</FooterLink>
            </li>
          </FooterNav>

          <FooterNav id="footer-company" title="Company">
            <li>
              <FooterLink to="/about">About</FooterLink>
            </li>
            <li>
              <FooterLink to="/professionals">Our care team</FooterLink>
            </li>
            <li>
              <FooterLink to="/partner">Join the network</FooterLink>
            </li>
            <li>
              <FooterLink to="/careers">Careers</FooterLink>
            </li>
            <li>
              <FooterLink to="/contact">Contact</FooterLink>
            </li>
            <li>
              <FooterLink to="/blog">Articles</FooterLink>
            </li>
          </FooterNav>

          <FooterNav id="footer-coverage" title="Areas served">
            {cities.map((c) => (
              <li key={c.slug}>
                <FooterLink to={`/home-nursing-${c.slug}`}>Home nursing in {c.name}</FooterLink>
              </li>
            ))}
            <li>
              <FooterLink to="/coverage">All localities</FooterLink>
            </li>
          </FooterNav>
        </div>

        {/* --- contact and legal ------------------------------------------- */}
        <div className="mt-[clamp(2.25rem,5vw,3.75rem)] flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-t border-surface/14 pt-2.75">
          <address className="text-meta text-surface/60 not-italic">
            <a
              href={`mailto:${brand.contact.email}`}
              className="text-surface/82 underline underline-offset-2"
            >
              {brand.contact.email}
            </a>
            <br />
            {brand.contact.address.line1}, {brand.contact.address.line2}
            <br />
            {brand.contact.address.city} {brand.contact.address.pincode}
          </address>

          <ul className="flex flex-wrap gap-x-2.5 gap-y-1">
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

        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-meta text-surface/60">
            &copy; {new Date().getFullYear()} {brand.legalName}
          </span>
          <span className="text-meta text-surface/60">
            Terms and privacy are pending legal review
          </span>
        </div>

        {/* The page says out loud that its contact details are not real. That is
            worth more than a plausible number nobody can call. */}
        <p className="mt-1.25 max-w-[70ch] text-meta text-surface/42">
          Brand name, phone number and address are placeholders held in the brand file, not real
          contact details.
        </p>
      </div>
    </footer>
  );
}

function FooterNav({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
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
