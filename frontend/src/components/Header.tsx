import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { cn } from '@shared/utils/index.js';
import { Logo } from './Logo.js';

const NAV = [
  { to: '/services', label: 'Services' },
  { to: '/professionals', label: 'Our care team' },
  { to: '/coverage', label: 'Areas served' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Articles' },
  { to: '/contact', label: 'Contact' },
];

/**
 * The floating glass header.
 *
 * Not a full-width bar: a pill inset from the edges, floating over whatever the
 * page happens to be. What makes it read as glass rather than as a grey slab is
 * the pair of inset highlights along its top and bottom edges - they behave
 * like a lit rim, and the piece looks flat without them.
 *
 * It condenses once, past 80px, and stays condensed. No expand-on-scroll-up and
 * no hide-on-scroll-down: a header that changes height every time the scroll
 * direction flips puts the phone number somewhere different each time a thumb
 * reaches for it. The number and the primary action stay visible at both
 * heights.
 *
 * The two actions are deliberately the opposite way round from the usual
 * arrangement. The phone number takes the filled navy pill, because a family
 * deciding about care at 11pm calls rather than fills a form, and "Request
 * care" takes the white one. Both are actions; the fill says which one this
 * business expects to be used.
 *
 * The backdrop blur is the expensive thing here, so it sits on one element that
 * never resizes during scroll and the compositor can cache it.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (condensed) return;
    const onScroll = () => {
      if (window.scrollY > 80) setCondensed(true);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [condensed]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape closes the drawer. A full-screen overlay with no keyboard exit is a
  // trap, and this one covers the viewport.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-transparent px-(--page-gutter) py-1.5">
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1120px] items-center justify-between gap-2',
          'rounded-pill border border-[rgba(255,255,255,.5)] bg-[rgba(255,255,255,.52)]',
          'pr-1 pl-3 backdrop-blur-[26px] backdrop-saturate-[190%]',
          'transition-[height,box-shadow] duration-(--dur-state) ease-state',
          condensed ? 'h-7.5 shadow-glass-lifted' : 'h-8.5 shadow-glass',
        )}
      >
        <Link to="/" className="flex shrink-0 items-center" aria-label={`${brand.name}, home`}>
          <Logo
            className={cn(
              'w-auto transition-[height] duration-(--dur-state) ease-state',
              condensed ? 'h-2.5' : 'h-3',
            )}
          />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-3.75">
            {NAV.map((item) => (
              <li key={item.to} className="inline-flex items-center">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'text-small whitespace-nowrap no-underline',
                      'transition-colors duration-(--dur-state) ease-state hover:text-accent',
                      isActive ? 'text-accent' : 'text-pewter-text',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-0.75">
          <a
            href={telHref()}
            data-analytics="header-call"
            className="inline-flex h-6 shrink-0 items-center gap-1 rounded-pill bg-navy pr-2.5 pl-2.75 text-small whitespace-nowrap text-surface no-underline transition-colors duration-(--dur-state) ease-state hover:bg-navy-hover"
          >
            <PhoneIcon />
            <span className="hidden lg:inline">{brand.contact.phoneDisplay}</span>
            <span className="sr-only lg:hidden">Call {brand.contact.phoneDisplay}</span>
          </a>

          <Link
            to="/book"
            className="hidden h-6 shrink-0 items-center gap-1 rounded-pill bg-surface px-2.75 text-small whitespace-nowrap text-navy no-underline transition-colors duration-(--dur-state) ease-state hover:bg-pewter-lo lg:inline-flex"
          >
            Request care
            <svg
              viewBox="0 0 20 20"
              className="size-[17px] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4.17 10h11.66M15.83 10 10 4.17M15.83 10 10 15.83" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-1 grid size-6 place-items-center rounded-pill text-ink lg:hidden"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg
              viewBox="0 0 24 24"
              className="size-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen drawer over a blur, with the actions pinned to the bottom
          where a thumb reaches. */}
      <div
        id="mobile-nav"
        inert={!open}
        className={cn(
          'fixed inset-x-0 top-11.5 bottom-0 z-30 flex flex-col lg:hidden',
          'bg-[rgba(244,245,247,.82)] backdrop-blur-[26px] backdrop-saturate-[180%]',
          'transition-opacity duration-(--dur-state) ease-state',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <nav aria-label="Main, mobile" className="flex-1 overflow-y-auto">
          <ul className="flex flex-col px-(--page-gutter) py-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-7 items-center border-b border-line text-body-lg no-underline',
                      isActive ? 'text-accent' : 'text-ink',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/partner"
                className="flex min-h-7 items-center border-b border-line text-body-lg text-ink no-underline"
              >
                Join the network
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-1 border-t border-line px-(--page-gutter) py-2">
          <Link
            to="/book"
            className="inline-flex h-7 items-center justify-center rounded-pill bg-navy text-body font-medium text-surface no-underline"
          >
            Request care
          </Link>
          <a
            href={telHref()}
            data-analytics="drawer-call"
            className="inline-flex h-7 items-center justify-center gap-1 rounded-pill border border-midnight text-body font-medium text-midnight no-underline"
          >
            <PhoneIcon />
            <span>Call {brand.contact.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-1.75 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7a1.3 1.3 0 0 1-.2 1.7l-.7.6a8 8 0 0 0 3.4 3.4l.6-.7a1.3 1.3 0 0 1 1.7-.2l1.7 1.2a1.3 1.3 0 0 1 .3 1.8l-.8 1.1a2 2 0 0 1-2.3.7C7.6 12 4 8.4 2.6 4.6a2 2 0 0 1 .7-2.3l.4-.8Z" />
    </svg>
  );
}
