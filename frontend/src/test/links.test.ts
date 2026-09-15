import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brand } from '@shared/brand.js';

/**
 * The dead-link check.
 *
 * Spec 10 makes "no dead links anywhere including the footer" a condition of
 * shipping Phase 1. Clicking every link by hand does not scale and does not
 * survive the next edit, so this walks the source instead: every internal
 * destination written anywhere in the app has to match a route the router can
 * actually serve.
 *
 * It is a static check, which means it also catches a link to a route that was
 * renamed, and a `to="#"` placeholder left behind in a hurry.
 */

// Under jsdom import.meta.url is an http URL, so the source root comes from
// the vitest working directory instead.
const SRC = join(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(SRC);

/** Every path the router serves, as literal strings and as patterns. */
const STATIC_ROUTES = new Set<string>([
  '/',
  '/services',
  '/book',
  '/book/confirmation',
  '/professionals',
  '/coverage',
  '/about',
  '/partner',
  '/partner/confirmation',
  '/careers',
  '/contact',
  '/blog',
  '/terms',
  '/privacy',
  ...brand.cities.filter((c) => c.isLaunched).map((c) => `/home-nursing-${c.slug}`),
]);

const DYNAMIC_ROUTES = [/^\/services\/[^/]+$/, /^\/blog\/[^/]+$/];

interface FoundLink {
  file: string;
  to: string;
}

/** Collects `to="..."` and `to={`...`}` from Link and NavLink usages. */
function collectLinks(): FoundLink[] {
  const found: FoundLink[] = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const short = file.slice(SRC.length).replace(/\\/g, '/');

    for (const [, to] of source.matchAll(/\bto="([^"]+)"/g)) {
      if (to) found.push({ file: short, to });
    }
    // Template literals: to={`/services/${s.slug}`} -> /services/:param
    for (const [, tpl] of source.matchAll(/\bto=\{`([^`]+)`\}/g)) {
      if (tpl) found.push({ file: short, to: tpl.replace(/\$\{[^}]+\}/g, ':param') });
    }
  }
  return found;
}

const links = collectLinks();

/**
 * Destinations built from a template literal, reduced to `:param` by the
 * collector. Each still has to correspond to a route the table generates - the
 * city landing pages exist one per launched city, so the pattern is only
 * servable while at least one city is launched.
 */
const TEMPLATE_PATTERNS: [RegExp, () => boolean][] = [
  [/^\/services\/:param$/, () => true],
  [/^\/blog\/:param$/, () => true],
  [/^\/home-nursing-:param$/, () => brand.cities.some((c) => c.isLaunched)],
];

function isServable(to: string): boolean {
  if (to.startsWith('http') || to.startsWith('mailto:') || to.startsWith('tel:')) return true;
  const path = to.split('?')[0]?.split('#')[0] ?? '';
  if (path === '') return false;
  if (STATIC_ROUTES.has(path)) return true;
  if (DYNAMIC_ROUTES.some((re) => re.test(path))) return true;
  return TEMPLATE_PATTERNS.some(([re, ok]) => re.test(path) && ok());
}

describe('every internal link resolves to a real route', () => {
  it('finds links to check', () => {
    expect(links.length).toBeGreaterThan(20);
  });

  it('has no placeholder anchors', () => {
    const placeholders = links.filter((l) => l.to === '#' || l.to === '');
    expect(placeholders).toEqual([]);
  });

  it('points every link at a servable path', () => {
    const broken = links.filter((l) => !isServable(l.to));
    expect(broken.map((b) => `${b.file} -> ${b.to}`)).toEqual([]);
  });
});

describe('the footer reaches every section of the site', () => {
  const footer = readFileSync(join(SRC, 'components', 'Footer.tsx'), 'utf8');

  it.each(['/about', '/professionals', '/partner', '/careers', '/blog', '/contact', '/terms', '/privacy', '/coverage'])(
    'links to %s',
    (path) => {
      expect(footer).toContain(`to="${path}"`);
    },
  );
});

describe('the phone number is reachable from every page', () => {
  it('is in the sticky header', () => {
    const header = readFileSync(join(SRC, 'components', 'Header.tsx'), 'utf8');
    expect(header).toContain('telHref()');
  });

  it('is in the footer', () => {
    const footer = readFileSync(join(SRC, 'components', 'Footer.tsx'), 'utf8');
    expect(footer).toContain('telHref()');
  });

  it('never hardcodes a phone number outside the brand file', () => {
    // A number typed into a page would survive a rebrand and quietly send
    // callers to the wrong place.
    const offenders: string[] = [];
    for (const file of files) {
      if (file.includes('brand.ts')) continue;
      const source = readFileSync(file, 'utf8');
      if (/\+91[\s-]?\d{2,}/.test(source)) offenders.push(file.slice(SRC.length));
    }
    expect(offenders).toEqual([]);
  });
});
