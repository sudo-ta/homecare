import { Outlet, ScrollRestoration } from 'react-router';
import { ToastProvider } from '@shared/ui/index.js';
import { Footer } from '@/components/Footer.js';
import { Header } from '@/components/Header.js';
import { MobileActionBar } from '@/components/MobileActionBar.js';

export function Layout() {
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
