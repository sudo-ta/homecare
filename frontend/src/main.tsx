import { StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { brand } from '@shared/brand.js';
import { SkeletonGroup, Skeleton } from '@shared/ui/index.js';
import { routes } from './app/routes.js';
import { medicalBusinessSchema } from './components/Seo.js';
import { installLinkTracking } from './lib/analytics.js';
import './index.css';

const router = createBrowserRouter(routes);

/**
 * Shown while a lazily-loaded route chunk arrives. It reserves the page's
 * vertical space so the layout does not jump when the real page lands, which
 * is where a route-split site usually loses its CLS budget.
 */
function RouteFallback() {
  return (
    <SkeletonGroup label="Loading page" className="container-page section-y flex flex-col gap-2">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton shape="card" className="mt-2 h-[20rem]" />
    </SkeletonGroup>
  );
}

function App() {
  useEffect(() => installLinkTracking(), []);

  return (
    <>
      {/* Site-wide organisation schema. Per-page schema is added by Seo. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalBusinessSchema()) }}
      />
      <Suspense fallback={<RouteFallback />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root missing from index.html');

if (import.meta.env.PROD && import.meta.env.VITE_DEMO_CONTENT === 'true') {
  // eslint-disable-next-line no-console
  console.warn(
    `[${brand.shortName}] VITE_DEMO_CONTENT is on in a production build. ` +
      'Placeholder professionals, team members and reviews are being served as if real. ' +
      'Turn it off before this reaches the public.',
  );
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
