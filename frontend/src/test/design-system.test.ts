import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { brand } from '@shared/brand.js';

/**
 * The design system's own self-check, as a test.
 *
 * Section 9 of the theme spec lists the conditions that mean the work should be
 * rejected. Most of them are greppable, so they are checked here rather than
 * left to someone remembering the list during review.
 */

const FRONTEND_SRC = join(process.cwd(), 'src');
const SHARED_SRC = join(process.cwd(), '..', 'shared', 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const files = [...walk(FRONTEND_SRC), ...walk(SHARED_SRC)];
const sources = files.map((f) => ({ file: f, text: readFileSync(f, 'utf8') }));

/**
 * Comments are documentation, not markup. Several files name a forbidden class
 * in order to explain why it is forbidden, and flagging those would train
 * everyone to ignore this suite.
 */
const stripComments = (text: string): string =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const code = sources.map((s) => ({ ...s, text: stripComments(s.text) }));

/** Repo-relative, forward-slashed, so a test name reads the same on any OS. */
const relative = (file: string): string =>
  file.replace(process.cwd(), '').split(sep).join('/');

/** theme.css legitimately names the tokens; application code may not misuse them. */
const appSources = code.filter((s) => !s.file.endsWith('theme.css'));

describe('7. no stock Tailwind colour name appears in application code', () => {
  // The palette is cleared to `initial` in theme.css so these generate nothing,
  // but a developer writing one would see a silently unstyled element rather
  // than an error, which is worth catching here.
  const STOCK =
    /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|accent|shadow)-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;

  it.each(appSources.map((s) => [s.file.replace(process.cwd(), ''), s.text] as const))(
    '%s',
    (_file, text) => {
      expect(text.match(STOCK)?.[0] ?? null).toBeNull();
    },
  );
});

describe('2. a verification badge is never a neutral grey', () => {
  const badge = readFileSync(join(SHARED_SRC, 'ui', 'Badge.tsx'), 'utf8');
  const toneLine = (tone: string) =>
    badge.split('\n').find((l) => l.trim().startsWith(`${tone}:`)) ?? '';

  it('renders the verified tone in the brass', () => {
    expect(toneLine('verified')).toContain('brass');
  });

  it('keeps metadata badges neutral, so the two cannot be confused', () => {
    const neutral = toneLine('neutral');
    expect(neutral).toContain('ink-soft');
    expect(neutral).not.toContain('text-brass-text');
  });
});

describe('8. body text is never set at 16px or smaller', () => {
  it('sets the base at 17px', () => {
    const theme = readFileSync(join(SHARED_SRC, 'tokens', 'theme.css'), 'utf8');
    expect(theme).toContain('--text-body: 1.0625rem;');
  });

  it('never applies a raw font-size below 17px in application code', () => {
    const offenders: string[] = [];
    for (const { file, text } of appSources) {
      // Arbitrary Tailwind sizes such as text-[14px] bypass the scale.
      const m = text.match(/text-\[(\d+)px\]/);
      if (m && Number(m[1]) < 17) offenders.push(file.replace(process.cwd(), ''));
    }
    expect(offenders).toEqual([]);
  });
});

describe('5. desktop section spacing is not compressed below 112px', () => {
  const theme = readFileSync(join(SHARED_SRC, 'tokens', 'theme.css'), 'utf8');

  it('holds section-y at 7rem on desktop', () => {
    expect(theme).toMatch(/\.section-y\s*\{\s*padding-block:\s*7rem;/);
  });
});

describe('6. sections do not fade and slide up on scroll indiscriminately', () => {
  it('reveals on entrance from exactly one component', () => {
    // Section entrance is allowed, but only through Reveal, so the count is
    // enforceable in one place. Hand-rolled observers elsewhere would route
    // around that limit.
    const users = appSources.filter((s) => s.text.includes('IntersectionObserver'));
    expect(users.map((u) => relative(u.file))).toEqual(['/src/lib/motion.ts']);
  });

  it('uses the hero reveal only on the home page', () => {
    const users = appSources.filter((s) => /data-motion=\{motion\}|useFirstVisitThisSession/.test(s.text));
    expect(users.map((u) => relative(u.file)).sort()).toEqual([
      '/src/lib/motion.ts',
      '/src/pages/Home.tsx',
    ]);
  });

  it('never lifts a card on hover', () => {
    const offenders = appSources.filter((s) => /hover:-translate-y|hover:scale-1/.test(s.text));
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });
});

describe('4. cards do not share the buttons radius', () => {
  it('keeps the pill on buttons and 8px on cards', () => {
    const button = readFileSync(join(SHARED_SRC, 'ui', 'Button.tsx'), 'utf8');
    const card = readFileSync(join(SHARED_SRC, 'ui', 'Card.tsx'), 'utf8');
    expect(button).toContain('rounded-pill');
    expect(card).toContain('rounded-card');
    expect(card).not.toContain('rounded-pill');
  });
});

describe('3. only one dark band appears per page', () => {
  // A dark band is a full-width section painted --midnight. Section components
  // are tinted or paper; a dark band is written inline.
  const pages = sources.filter((s) => s.file.includes(join('src', 'pages')));

  it.each(pages.map((p) => [p.file.replace(process.cwd(), '').replace(/\\/g, '/'), p.text] as const))(
    '%s',
    (_file, text) => {
      // bg-midnight(?!-) so the light bg-midnight-lo tint is not counted: \b
      // treats the hyphen as a word boundary and would match it.
      const darkBands = text.match(/className="[^"]*\bbg-midnight(?!-)[^"]*"/g) ?? [];
      // Filter out anything that is a control rather than a band.
      const bands = darkBands.filter((c) => /border-t|border-b|section/.test(c));
      expect(bands.length).toBeLessThanOrEqual(1);
    },
  );
});

describe('the brass is used for meaning, never as a fill', () => {
  it('never uses pewter-strong as a button fill', () => {
    const button = readFileSync(join(SHARED_SRC, 'ui', 'Button.tsx'), 'utf8');
    expect(button).not.toMatch(/bg-pewter-strong\b/);
    expect(button).not.toMatch(/bg-brass\b/);
  });

  it('never sets text in the structural border colour', () => {
    // --pewter-strong bounds controls. It measures 3.3:1 on the page, which is a
    // border colour, not a text colour. Metadata takes --ink-soft at 5.0:1.
    const offenders: string[] = [];
    for (const { file, text } of appSources) {
      if (/text-pewter-strong/.test(text)) offenders.push(relative(file));
    }
    expect(offenders).toEqual([]);
  });
});

describe('10. the word "loved one" appears nowhere', () => {
  it.each(sources.map((s) => [s.file.replace(process.cwd(), ''), s.text] as const))(
    '%s',
    (_file, text) => {
      expect(/loved ones?\b/i.test(text)).toBe(false);
    },
  );
});

describe('the words the voice forbids', () => {
  const BANNED = /\b(simply|seamless|unlock your|empower|successfully)\b/i;

  it.each(
    sources
      .filter((s) => s.file.includes(join('src', 'content')) || s.file.includes(join('src', 'pages')))
      .map((s) => [s.file.replace(process.cwd(), ''), s.text] as const),
  )('%s', (_file, text) => {
    expect(text.match(BANNED)?.[0] ?? null).toBeNull();
  });
});


describe('the brand name lives only in brand.ts', () => {
  // The name is still a placeholder, and the point of the swap point is that
  // choosing one is a single edit. A literal copy in a page would survive that
  // edit and quietly contradict it - which had already happened once, in the
  // health-data consent label on the booking form, where it would have named
  // the wrong data controller after a rebrand.
  const nameLiteral = brand.name;

  it.each(
    appSources
      .filter((s) => !s.file.endsWith('brand.ts'))
      .map((s) => [relative(s.file), s.text] as const),
  )('%s', (_file, text) => {
    expect(text.includes(nameLiteral)).toBe(false);
  });
});

describe('motion spec reject list', () => {
  const theme = readFileSync(join(SHARED_SRC, 'tokens', 'theme.css'), 'utf8');
  const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    dependencies: Record<string, string>;
  };

  it('1. ships no motion library', () => {
    const banned = [
      'motion',
      'framer-motion',
      'gsap',
      'locomotive-scroll',
      'barba.js',
      '@barba/core',
      'lenis',
      '@studio-freight/lenis',
      'three',
      'lottie-web',
      '@lottiefiles/react-lottie-player',
      '@rive-app/react-canvas',
      'countup.js',
      'odometer',
    ];
    const found = banned.filter((b) => b in pkg.dependencies);
    expect(found).toEqual([]);
  });

  it('2. never smooths, hijacks or proxies scroll', () => {
    const offenders = appSources.filter((s) =>
      /scrollBehavior:\s*'smooth'|ScrollSmoother|Lenis|LocomotiveScroll|scroll-snap-type:\s*y\s+mandatory/.test(
        s.text,
      ),
    );
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });

  it('3. animates at most three sections on entrance, all on the home page', () => {
    const users = appSources.filter((s) => /<Reveal[\s>]/.test(s.text));
    expect(users.map((u) => relative(u.file))).toEqual(['/src/pages/Home.tsx']);

    const home = users[0]?.text ?? '';
    expect((home.match(/<Reveal[\s>]/g) ?? []).length).toBe(3);
  });

  it('4. animates no section on any other page', () => {
    const others = appSources.filter(
      (s) =>
        s.file.includes(join('src', 'pages')) &&
        !s.file.endsWith(`Home.tsx`) &&
        /data-motion=['"]reveal['"]/.test(s.text),
    );
    expect(others.map((o) => relative(o.file))).toEqual([]);
  });

  it('5. never lifts, scales or shadows a card on hover', () => {
    const offenders = appSources.filter((s) =>
      /hover:(-?translate-y|scale-|shadow-)/.test(s.text),
    );
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });

  it('6. leaves no decorative motion running under reduced motion', () => {
    const block = theme.slice(theme.indexOf('@media (prefers-reduced-motion: reduce)'));
    // Every decorative data-motion channel must be named in the opt-out.
    for (const channel of ['hero', 'mask', 'row', 'step', 'marquee', 'wipe', 'reveal']) {
      expect(block).toContain(`[data-motion='${channel}']`);
    }
    // And the durations are zeroed rather than merely shortened.
    expect(block).toMatch(/--dur-reveal:\s*0ms/);
    expect(block).toMatch(/--dur-state:\s*0ms/);
  });

  it('7. leaves the pincode surface interactive during the hero reveal', () => {
    const home = readFileSync(join(FRONTEND_SRC, 'pages', 'Home.tsx'), 'utf8');
    const pincodeLine =
      home.split('\n').find((l) => l.includes('<PincodeCheck')) ?? '';
    const wrapper = home.slice(0, home.indexOf('<PincodeCheck')).split('\n').slice(-3).join('\n');
    expect(pincodeLine).not.toContain('data-motion');
    expect(wrapper).not.toContain('data-motion');
  });

  it('8. never replays the hero reveal on internal navigation', () => {
    const home = readFileSync(join(FRONTEND_SRC, 'pages', 'Home.tsx'), 'utf8');
    expect(home).toContain('useFirstVisitThisSession');
    const motionLib = readFileSync(join(FRONTEND_SRC, 'lib', 'motion.ts'), 'utf8');
    expect(motionLib).toContain('sessionStorage');
  });

  it('9. counts no number up anywhere', () => {
    const offenders = appSources.filter((s) => /countUp|CountUp|odometer|useCountTo/.test(s.text));
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });

  it('10. never leaves display type at normal tracking', () => {
    // The imported theme tracks its display sizes negatively throughout.
    expect(theme).toContain('--text-display--letter-spacing: -0.04em');
    expect(theme).toContain('--text-h1--letter-spacing: -0.035em');
    expect(theme).toContain('--text-h2--letter-spacing: -0.035em');
  });

  it('keeps display line-height tight and body line-height comfortable', () => {
    expect(theme).toContain('--text-display--line-height: 1.04');
    expect(theme).toContain('--text-h1--line-height: 1.06');
    expect(theme).toContain('--text-body--line-height: 1.65');
  });

  it('11. keeps the vocabulary at three easings and five durations', () => {
    const easings = [...theme.matchAll(/^\s*--ease-(?!\*)([a-z-]+):/gm)].map((m) => m[1]);
    const durations = [...theme.matchAll(/^\s*--dur-([a-z-]+):/gm)].map((m) => m[1]);
    // Four now: the revision adds --ease-float for the locality pills drifting
    // over the coverage gradient. Nothing that a person sees ENTER uses it, so
    // the three-easing rule for entrances still holds.
    expect(new Set(easings)).toEqual(new Set(['signature', 'reveal', 'state', 'float']));
    expect(new Set(durations)).toEqual(
      new Set(['hover', 'state', 'panel', 'reveal', 'signature']),
    );
  });

  it('uses no bare ease, linear or ease-in-out on anything entering', () => {
    const offenders = appSources.filter((s) =>
      /\b(ease-in-out|ease-linear|ease-in\b)/.test(s.text),
    );
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });

  it('never writes a duration utility that silently generates nothing', () => {
    // duration-standard was a real bug: Tailwind has no --duration-* namespace,
    // so 23 call sites ran at the 150ms default instead of their stated timing.
    const offenders = appSources.filter((s) => /duration-(?!\(|\[)[a-z]/.test(s.text));
    expect(offenders.map((o) => relative(o.file))).toEqual([]);
  });

  it('sets prices in tabular figures so they align down a column', () => {
    const card = readFileSync(join(FRONTEND_SRC, 'components', 'ServiceCard.tsx'), 'utf8');
    expect(card).toContain('tabular-nums');
  });
});
