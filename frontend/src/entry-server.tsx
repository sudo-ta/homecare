import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouterProvider, createStaticHandler, createStaticRouter } from 'react-router';
import About from '@/pages/About.js';
import Blog from '@/pages/Blog.js';
import BlogPost from '@/pages/BlogPost.js';
import Book from '@/pages/Book.js';
import BookConfirmation from '@/pages/BookConfirmation.js';
import Careers from '@/pages/Careers.js';
import CityLanding from '@/pages/CityLanding.js';
import Contact from '@/pages/Contact.js';
import Coverage from '@/pages/Coverage.js';
import Home from '@/pages/Home.js';
import NotFound from '@/pages/NotFound.js';
import Partner from '@/pages/Partner.js';
import PartnerConfirmation from '@/pages/PartnerConfirmation.js';
import Privacy from '@/pages/Privacy.js';
import Professionals from '@/pages/Professionals.js';
import ServiceDetail from '@/pages/ServiceDetail.js';
import Services from '@/pages/Services.js';
import Terms from '@/pages/Terms.js';
import { createRouteTable } from './app/routeTable.js';
import { medicalBusinessSchema } from './components/Seo.js';

/**
 * Server entry, used only by scripts/prerender.mjs at build time.
 *
 * Spec 9 asks for public pages that are server-rendered or pre-rendered. This
 * renders each public route to static HTML so a crawler, and anything that
 * reads a link preview, gets a real title, description, canonical URL and
 * structured data without executing JavaScript first.
 *
 * Pages are imported eagerly here, unlike in routes.tsx: renderToStaticMarkup
 * cannot resolve a React.lazy boundary, so a lazy table would prerender the
 * loading skeleton instead of the page. The server bundle's size does not
 * matter - it never reaches a browser.
 */
const routes = createRouteTable({
  Home,
  Services,
  ServiceDetail,
  Book,
  BookConfirmation,
  Professionals,
  Coverage,
  About,
  Partner,
  PartnerConfirmation,
  Careers,
  Contact,
  Blog,
  BlogPost,
  Terms,
  Privacy,
  CityLanding,
  NotFound,
});

const handler = createStaticHandler(routes);

export async function render(url: string): Promise<{ html: string; siteSchema: string }> {
  const context = await handler.query(new Request(`http://localhost${url}`));

  if (context instanceof Response) {
    throw new Error(`${url} produced a redirect during prerender, which is not expected`);
  }

  const router = createStaticRouter(routes, context);
  const html = renderToStaticMarkup(
    <StaticRouterProvider router={router} context={context} nonce={undefined} />,
  );

  return { html, siteSchema: JSON.stringify(medicalBusinessSchema()) };
}

/** Re-exported so the prerender script reads the path list from one place. */
export { noindexPaths, staticPublicPaths } from './app/routeTable.js';
