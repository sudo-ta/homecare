import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';

/**
 * The mobile action bar.
 *
 * Two actions pinned to the bottom of the viewport on small screens, which is
 * where a thumb already is. Both paths out of the page are always one tap away
 * regardless of how far down someone has scrolled, and neither is hidden behind
 * an icon that has to be interpreted.
 *
 * Sticky rather than fixed: it participates in layout, so it cannot cover the
 * last line of the footer the way a fixed bar does.
 *
 * It replaces the floating WhatsApp button that used to sit in this corner. One
 * round icon competing with a sticky bar for the same thumb zone is a worse
 * outcome than two labelled actions, and WhatsApp is still on the contact page.
 */
export function MobileActionBar() {
  return (
    <div className="sticky bottom-0 z-30 flex gap-1 border-t border-line bg-[rgba(244,245,247,.97)] px-(--page-gutter) py-1.5 backdrop-blur-[8px] lg:hidden">
      <a
        href={telHref()}
        data-analytics="mobile-bar-call"
        className="inline-flex h-6 flex-1 items-center justify-center rounded-pill border border-midnight text-small font-medium text-midnight no-underline"
      >
        Call
        <span className="sr-only"> {brand.contact.phoneDisplay}</span>
      </a>
      <Link
        to="/book"
        data-analytics="mobile-bar-book"
        className="inline-flex h-6 flex-1 items-center justify-center rounded-pill bg-navy text-small font-medium text-surface no-underline"
      >
        Request care
      </Link>
    </div>
  );
}
