import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { ToastProvider } from '@shared/ui/index.js';
import { Footer } from '@/components/Footer.js';
import { Header } from '@/components/Header.js';
import { MobileActionBar } from '@/components/MobileActionBar.js';

/**
 * Scrolls to the section a hash link names.
 *
 * The nav points at #services and #team, which are sections of the home page
 * rather than routes. React Router does not act on a hash by itself, and
 * ScrollRestoration deliberately does not either, so arriving from another page
 * would otherwise land at the top with nothing having visibly happened.
 *
 * The rAF lets the destination route paint first: on a cross-page jump the
 * target does not exist at the moment the location changes.
 */
function useHashScroll() {
  const { hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.querySelector(hash)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, key]);
}

export function Layout() {
  useHashScroll();

  return (
    <ToastProvider>
      <a href="#main" className="skip-link rounded-pill bg-ink px-2 py-1 text-paper">
        Skip to content
      </a>

      <Header />

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />

      {/* Below the footer in the DOM so it is the last thing in the tab order,
          and sticky rather than fixed so it cannot cover the footer's last
          line. Small screens only: above lg the header carries both actions. */}
      <MobileActionBar />

      <ScrollRestoration />
    </ToastProvider>
  );
}
