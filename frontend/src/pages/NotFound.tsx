import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { buttonClasses } from '@shared/ui/index.js';
import { Seo } from '@/components/Seo.js';
import { Section } from '@/components/Section.js';

export default function NotFound() {
  return (
    <>
      <Seo
        title={`Page not found - ${brand.name}`}
        description="That page does not exist."
        path="/404"
        noindex
      />
      <Section>
        <div className="measure flex flex-col gap-2">
          <h1 className="text-h1">That page does not exist</h1>
          <p className="text-body-lg text-ink-soft">
            The link may be out of date, or the address may have a typo in it. Everything on the
            site is reachable from the pages below.
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Link to="/" className={buttonClasses('primary', 'md')}>
              Go to the home page
            </Link>
            <Link to="/services" className={buttonClasses('secondary', 'md')}>
              See what we do
            </Link>
            <a href={telHref()} className={buttonClasses('ghost', 'md')} data-analytics="404-call">
              Call {brand.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
