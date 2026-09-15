import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { buttonClasses } from '@shared/ui/index.js';
import { Section } from '@/components/Section.js';

/**
 * Global error boundary (spec 9).
 *
 * A 404 from the router and a thrown render error land here. Both are written
 * in the product voice: say what happened, and give a way forward that does not
 * depend on the thing that just broke - which is why the phone number is on it.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Section>
      <div className="measure flex flex-col gap-2">
        <h1 className="text-h1">{is404 ? 'That page does not exist' : 'Something went wrong'}</h1>
        <p className="text-body-lg text-ink-soft">
          {is404
            ? 'The link may be out of date, or the address may have a typo in it.'
            : 'That is a problem at our end, not yours. Nothing you entered has been sent anywhere.'}
        </p>
        <p className="text-body text-ink-soft">
          If you need care now, call a coordinator on{' '}
          <a
            href={telHref()}
            data-analytics="error-call"
            className="font-medium text-ink underline underline-offset-2"
          >
            {brand.contact.phoneDisplay}
          </a>
          .
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          <Link to="/" className={buttonClasses('primary', 'md')}>
            Go to the home page
          </Link>
          {!is404 ? (
            <button type="button" onClick={() => location.reload()} className={buttonClasses('secondary', 'md')}>
              Reload this page
            </button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
