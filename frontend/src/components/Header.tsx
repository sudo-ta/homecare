import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { cn } from '@shared/utils/index.js';

const NAV = [
  { to: '/services', label: 'Services' },
  { to: '/professionals', label: 'Our care team' },
  { to: '/coverage', label: 'Areas served' },
  { to: '/blog', label: 'Articles' },
  { to: '/contact', label: 'Contact' },
];

/**
 * The floating glass header.
 *
 * Not a full-width bar: a pill inset from the edges, floating over whatever the
 * page happens to be. What makes it read as glass rather than as a grey slab is
 * the inset highlight along its top edge, which behaves like a lit rim.
 *
 * Two variants, because the header sits on two different grounds. Over the home
 * hero it is barely there and the primary action is white, since the ground is
 * already saturated. On every other page it is more opaque and the action is
 * filled blue, because a white pill on a white page is not an action.
 *
 * The backdrop blur is the expensive thing here, so it sits on one element that
 * never resizes and the compositor can cache it.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === '/';

  useEffect(() => setOpen(false), [location.pathname]);

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
          'mx-auto flex h-8.5 w-full max-w-[1120px] items-center justify-between gap-2',
          'rounded-pill pr-1 pl-3 backdrop-blur-[14px] backdrop-saturate-[170%]',
          onHome
            ? 'border border-[rgba(255,255,255,.5)] bg-[rgba(255,255,255,.52)] shadow-[0_6px_24px_rgba(16,20,31,.1),inset_0_1px_0_rgba(255,255,255,.75)]'
            : 'border border-[rgba(255,255,255,.75)] bg-[rgba(255,255,255,.72)] shadow-[0_10px_32px_rgba(16,20,31,.14),inset_0_1px_0_rgba(255,255,255,.85)]',
        )}
      >
        <Link
          to="/"
          className="shrink-0 font-display text-[1.4375rem] leading-none tracking-[-.02em] text-ink no-underline"
        >
          {brand.name}
        </Link>

        <nav aria-label="Main" className="hidden min-w-0 overflow-hidden xl:block">
          <ul className="flex items-center gap-3.75 whitespace-nowrap">
            {NAV.map((item) => (
              <li key={item.to} className="inline-flex items-center">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'text-small whitespace-nowrap no-underline',
                      'transition-colors duration-(--dur-state) ease-state hover:text-accent',
                      isActive ? 'font-medium text-blue' : 'text-pewter-text',
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
            className={cn(
              'inline-flex h-6 shrink-0 items-center gap-1 rounded-pill pr-2.5 pl-2.75',
              'text-small font-medium whitespace-nowrap no-underline',
              'transition-colors duration-(--dur-state) ease-state',
              onHome
                ? 'bg-[rgba(255,255,255,.62)] text-blue-deep hover:bg-surface'
                : 'bg-pewter-lo text-blue-deep hover:bg-midnight-lo',
            )}
          >
            <PhoneIcon />
            <span className="hidden xl:inline">{brand.contact.phoneDisplay}</span>
            <span className="sr-only xl:hidden">Call {brand.contact.phoneDisplay}</span>
          </a>

          <Link
            to="/book"
            className={cn(
              'hidden h-6 shrink-0 items-center rounded-pill px-2.75 text-small whitespace-nowrap no-underline',
              'transition-colors duration-(--dur-state) ease-state xl:inline-flex',
              onHome
                ? 'bg-surface text-navy hover:bg-pewter-lo'
                : 'bg-blue font-medium text-surface hover:bg-blue-deep',
            )}
          >
            Request care
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-1 grid size-6 place-items-center rounded-pill text-ink xl:hidden"
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
          'fixed inset-x-0 top-11.5 bottom-0 z-30 flex flex-col xl:hidden',
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
                      isActive ? 'font-medium text-blue' : 'text-ink',
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
    <svg viewBox="0 0 16 16" className="size-[14px] shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7a1.3 1.3 0 0 1-.2 1.7l-.7.6a8 8 0 0 0 3.4 3.4l.6-.7a1.3 1.3 0 0 1 1.7-.2l1.7 1.2a1.3 1.3 0 0 1 .3 1.8l-.8 1.1a2 2 0 0 1-2.3.7C7.6 12 4 8.4 2.6 4.6a2 2 0 0 1 .7-2.3l.4-.8Z" />
    </svg>
  );
}
