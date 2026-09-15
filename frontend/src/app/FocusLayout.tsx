import { useEffect } from 'react';
import { Link, Outlet, ScrollRestoration } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { ToastProvider } from '@shared/ui/index.js';

/**
 * The shell for the booking flow.
 *
 * Not the marketing chrome. A form someone fills in while a relative is being
 * discharged is not a page to browse, so the site nav, the footer and the
 * mobile action bar are all gone: there is one way forward, one way back, and
 * a phone number.
 *
 * The shell is locked to the viewport and `main` scrolls inside it. That keeps
 * the header and the phone number fixed without `position: fixed`, and it stops
 * the mobile browser chrome collapsing and re-expanding under a tall form,
 * which is what makes a long form on a phone feel like it is jumping.
 *
 * 100dvh rather than 100vh, because on iOS Safari 100vh is taller than the
 * visible area and the last field ends up under the address bar.
 */
export function FocusLayout() {
  // The shell owns the scroll, so the document must not also scroll. Reverted on
  // unmount, or every page navigated to afterwards would be stuck.
  useEffect(() => {
    const root = document.documentElement;
    const previousHtml = root.style.overflow;
    const previousBody = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousHtml;
      document.body.style.overflow = previousBody;
    };
  }, []);

  return (
    <ToastProvider>
      <a href="#main" className="skip-link rounded-pill bg-ink px-2 py-1 text-paper">
        Skip to content
      </a>

      <div className="flex h-[100dvh] flex-col overflow-hidden bg-surface">
        <header className="flex-none border-b border-line bg-[rgba(255,255,255,.92)] backdrop-blur-[18px] backdrop-saturate-[180%]">
          <div className="mx-auto flex h-8 w-full max-w-[1120px] items-center justify-between gap-2 px-(--page-gutter)">
            {/* Back to the site, not browser-back: someone who arrived here from
                a search result has no history to go back to. */}
            <Link to="/" className="flex items-center gap-1.25 text-ink no-underline">
              <svg
                viewBox="0 0 20 20"
                className="size-[17px] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15.83 10H4.17M4.17 10 10 4.17M4.17 10 10 15.83" />
              </svg>
              <span className="font-display text-[1.375rem] leading-none tracking-[-.02em]">
                {brand.name}
              </span>
            </Link>

            <a
              href={telHref()}
              data-analytics="booking-header-call"
              className="inline-flex h-5.5 items-center gap-1 rounded-pill bg-pewter-lo px-2.25 text-small font-medium whitespace-nowrap text-blue-deep no-underline"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-[14px] shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.7 1.5a1.3 1.3 0 0 1 1.8.3l1.2 1.7a1.3 1.3 0 0 1-.2 1.7l-.7.6a8 8 0 0 0 3.4 3.4l.6-.7a1.3 1.3 0 0 1 1.7-.2l1.7 1.2a1.3 1.3 0 0 1 .3 1.8l-.8 1.1a2 2 0 0 1-2.3.7C7.6 12 4 8.4 2.6 4.6a2 2 0 0 1 .7-2.3l.4-.8Z" />
              </svg>
              <span className="hidden sm:inline">{brand.contact.phoneDisplay}</span>
              <span className="sr-only sm:hidden">Call {brand.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#fff_0%,#f4f7fc_22%,#eef3fb_58%,#f7f9fd_86%,#fff_100%)]"
          />
          <div className="relative mx-auto w-full max-w-[1000px] px-(--page-gutter) pt-[clamp(1rem,2.4vw,1.625rem)] pb-[clamp(1.25rem,3vw,2rem)]">
            <Outlet />
          </div>
        </main>
      </div>

      <ScrollRestoration />
    </ToastProvider>
  );
}
