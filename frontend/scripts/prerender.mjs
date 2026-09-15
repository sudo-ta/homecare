/**
 * Prerenders the public routes to static HTML and writes the sitemap.
 *
 * Runs after `vite build` and `vite build --ssr`. For each public path it
 * renders the route, lifts the head tags React emitted inline into <head>, and
 * writes dist/<path>/index.html. A crawler, a link preview, or a browser with
 * JavaScript disabled then gets a real title, description, canonical URL and
 * structured data without executing anything.
 *
 * The client bundle still hydrates on top, so behaviour is unchanged.
 *
 * NOTE ON CONTENT: data is read through the fixtures transport, which resolves
 * from src/content at build time. That is correct for Phase 1, where the
 * catalogue is build-time content. Once VITE_API_MODE=live, this step should
 * fetch from the API first and pass the result in, or the prerendered markup
 * will be a snapshot of the fixtures rather than of the database.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL, URL as NodeURL } from 'node:url';

const here = (p) => fileURLToPath(new NodeURL(p, import.meta.url));
const DIST = here('../dist');
const ORIGIN = process.env.VITE_SITE_ORIGIN ?? 'http://localhost:5183';

/** Tags React 19 renders inline that belong in <head>. */
const HEAD_TAG_RE =
  /<(title|meta|link)\b[^>]*?(?:\/>|>(?:[\s\S]*?<\/\1>)?)|<script type="application\/ld\+json"[\s\S]*?<\/script>/gi;

/**
 * Pulls the head tags out of the rendered body and returns both halves.
 * React emits them where the component sits in the tree; a crawler wants them
 * in <head>, so they are relocated rather than duplicated.
 */
function hoistHead(bodyHtml) {
  const head = [];
  const body = bodyHtml.replace(HEAD_TAG_RE, (match) => {
    // Only hoist metadata links, never a stylesheet the bundler injected.
    if (/^<link/i.test(match) && !/rel="(canonical|alternate)"/i.test(match)) return match;
    head.push(match);
    return '';
  });
  return { head: head.join('\n    '), body };
}

async function main() {
  const template = await readFile(join(DIST, 'index.html'), 'utf8');
  const { render, staticPublicPaths: paths, noindexPaths: noindex } = await import(
    pathToFileURL(join(DIST, 'server/entry-server.js')).href
  );

  let written = 0;
  const failures = [];

  for (const path of paths) {
    try {
      const { html: appHtml, siteSchema } = await render(path);
      const { head, body } = hoistHead(appHtml);

      const page = template
        // The template carries a fallback <title> for the dev server. Left in
        // place it would come first in the document and win, so every
        // prerendered page would claim the same generic title.
        .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
        .replace(
          '</head>',
          `    ${head}\n    <script type="application/ld+json">${siteSchema}</script>\n  </head>`,
        )
        .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

      const outPath =
        path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html');
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, page, 'utf8');
      written++;
      console.log(`  ${path}`);
    } catch (err) {
      failures.push(`${path}: ${err.message}`);
    }
  }

  await writeSitemap(paths, noindex);

  console.log(`\nprerendered ${written}/${paths.length} routes`);
  if (failures.length > 0) {
    console.error('\nfailed:');
    for (const f of failures) console.error('  ' + f);
    process.exitCode = 1;
  }
}

async function writeSitemap(paths, noindex) {
  const today = new Date().toISOString().slice(0, 10);
  const skip = new Set(noindex);

  // Priority reflects how a visitor actually enters the site: the home page and
  // the city landing pages are the entry points, legal pages are not.
  const priority = (p) => {
    if (p === '/') return '1.0';
    if (p.startsWith('/home-nursing-')) return '0.9';
    if (p === '/services' || p === '/book') return '0.9';
    if (p === '/terms' || p === '/privacy') return '0.3';
    return '0.7';
  };

  const included = paths.filter((p) => !skip.has(p));
  const urls = included
    .map(
      (p) =>
        `  <url>\n    <loc>${ORIGIN}${p === '/' ? '/' : p}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority(p)}</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`\nsitemap.xml: ${included.length} urls`);
}

main().catch((err) => {
  console.error('prerender failed:', err);
  process.exit(1);
});
