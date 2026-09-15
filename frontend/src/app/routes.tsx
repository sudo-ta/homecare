import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import Home from '@/pages/Home.js';
import NotFound from '@/pages/NotFound.js';
import { createRouteTable, staticPublicPaths } from './routeTable.js';

/**
 * The browser route table.
 *
 * Home and the 404 are eager: Home is the LCP page and the one most visitors
 * land on, and NotFound is tiny and must render even if a chunk fails. Every
 * other route is split (spec 9), so a visitor reading an article never
 * downloads the booking flow's form machinery.
 *
 * The admin portal will be added here as one lazy chunk under /admin. Nothing
 * public references it, so it stays out of the public bundle - but the real
 * boundary is the API, which spec 3 requires to authorise server-side. Route
 * hiding is not access control.
 */
export const routes: RouteObject[] = createRouteTable({
  Home,
  NotFound,
  Services: lazy(() => import('@/pages/Services.js')),
  ServiceDetail: lazy(() => import('@/pages/ServiceDetail.js')),
  Book: lazy(() => import('@/pages/Book.js')),
  BookConfirmation: lazy(() => import('@/pages/BookConfirmation.js')),
  Professionals: lazy(() => import('@/pages/Professionals.js')),
  Coverage: lazy(() => import('@/pages/Coverage.js')),
  About: lazy(() => import('@/pages/About.js')),
  Partner: lazy(() => import('@/pages/Partner.js')),
  PartnerConfirmation: lazy(() => import('@/pages/PartnerConfirmation.js')),
  Careers: lazy(() => import('@/pages/Careers.js')),
  Contact: lazy(() => import('@/pages/Contact.js')),
  Blog: lazy(() => import('@/pages/Blog.js')),
  BlogPost: lazy(() => import('@/pages/BlogPost.js')),
  Terms: lazy(() => import('@/pages/Terms.js')),
  Privacy: lazy(() => import('@/pages/Privacy.js')),
  CityLanding: lazy(() => import('@/pages/CityLanding.js')),
});

export { staticPublicPaths };
