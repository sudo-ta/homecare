import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router';
import { brand } from '@shared/brand.js';
import { ErrorBoundary } from './ErrorBoundary.js';
import { FocusLayout } from './FocusLayout.js';
import { Layout } from './Layout.js';

/**
 * The single route definition, shared by the client router and the prerender.
 *
 * The page components are injected rather than imported here, because the two
 * callers need different module shapes: the browser wants React.lazy so each
 * route is its own chunk (spec 9), and the prerender needs them eager, since
 * renderToStaticMarkup cannot resolve a lazy boundary. Keeping the table itself
 * in one place stops the two from drifting, which is how a route ends up
 * reachable in the app but missing from the sitemap.
 */
export interface PageMap {
  Home: ComponentType;
  Services: ComponentType;
  ServiceDetail: ComponentType;
  Book: ComponentType;
  BookConfirmation: ComponentType;
  Professionals: ComponentType;
  Coverage: ComponentType;
  About: ComponentType;
  Partner: ComponentType;
  PartnerConfirmation: ComponentType;
  Careers: ComponentType;
  Contact: ComponentType;
  Blog: ComponentType;
  BlogPost: ComponentType;
  Terms: ComponentType;
  Privacy: ComponentType;
  CityLanding: ComponentType<{ citySlug: string }>;
  NotFound: ComponentType;
}

export function createRouteTable(p: PageMap): RouteObject[] {
  const cityRoutes: RouteObject[] = brand.cities
    .filter((c) => c.isLaunched)
    .map((c) => ({
      path: `home-nursing-${c.slug}`,
      element: <p.CityLanding citySlug={c.slug} />,
    }));

  return [
    /* The booking flow runs in its own shell: no site nav, no footer, no mobile
       action bar, and the viewport locked so the form scrolls inside it. A
       pathless layout route rather than a second route at '/', which would be
       ambiguous to rank. */
    {
      element: <FocusLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        { path: '/book', element: <p.Book /> },
        { path: '/book/confirmation', element: <p.BookConfirmation /> },
      ],
    },
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        { index: true, element: <p.Home /> },
        { path: 'services', element: <p.Services /> },
        { path: 'services/:slug', element: <p.ServiceDetail /> },
        { path: 'professionals', element: <p.Professionals /> },
        { path: 'coverage', element: <p.Coverage /> },
        { path: 'about', element: <p.About /> },
        { path: 'partner', element: <p.Partner /> },
        { path: 'partner/confirmation', element: <p.PartnerConfirmation /> },
        { path: 'careers', element: <p.Careers /> },
        { path: 'contact', element: <p.Contact /> },
        { path: 'blog', element: <p.Blog /> },
        { path: 'blog/:slug', element: <p.BlogPost /> },
        { path: 'terms', element: <p.Terms /> },
        { path: 'privacy', element: <p.Privacy /> },
        ...cityRoutes,
        { path: '*', element: <p.NotFound /> },
      ],
    },
  ];
}

/**
 * Routes that get prerendered and listed in the sitemap.
 *
 * The two confirmation screens are deliberately absent: they are noindex, and
 * they show nothing useful without the state a submission puts there.
 */
export const staticPublicPaths: string[] = [
  '/',
  '/services',
  '/book',
  '/professionals',
  '/coverage',
  '/about',
  '/partner',
  '/careers',
  '/contact',
  '/blog',
  '/terms',
  '/privacy',
  ...brand.cities.filter((c) => c.isLaunched).map((c) => `/home-nursing-${c.slug}`),
];

/** Paths that must never be indexed, even though they are real pages. */
export const noindexPaths: string[] = ['/book/confirmation', '/partner/confirmation'];
