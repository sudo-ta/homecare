# Home healthcare platform

Public website, API and operations portal for a home healthcare service:
qualified nurses, caregivers, physiotherapists and doctors dispatched to a
patient's home.

**Status: Phase 1 (public website) built. Phases 2 and 3 not started.**

---

## The swap points

Two files hold everything that changes when this stops being a working prototype.

### 1. `shared/src/brand.ts`

The brand name, city list, phone number, address and legal entity. Every
brand-facing string on the site resolves from here: no page, component, email
template, seed file or meta tag hardcodes any of them, and a test enforces that
for the phone number.

**The name is not decided.** `brand.name` is the literal token `[BRAND]`, left
bracketed on purpose so it is obvious in every page title, screenshot and email
that this is still open, rather than a plausible working name quietly becoming
the real one. The phone number, email and address are marked `PLACEHOLDER` in
the file and are not real.

A test asserts the value of `brand.name` appears in no other file, so the name
cannot get baked into a page. That had already happened once: the health-data
consent label on the booking form named the company in a string literal, which
after a rebrand would have stated the wrong data controller on a legal consent.

`brand.multiCity` decides how much of the multi-city model the visitor sees. The
data model, routing and content are city-scoped either way; turning the flag off
hides the city selector and the `/home-nursing-[city]` landing pages. Flipping it
needs no migration.

`brand.trust` holds `null` for any figure nobody has verified. The trust band
omits a slot rather than printing a plausible number, so an unverified claim
cannot reach the page by accident.

### 2. `frontend/.env` → `VITE_DEMO_CONTENT`

Three kinds of content are claims about real people: the professional profiles,
the leadership team, and the reviews. All three are hand-written placeholders and
are served **only** when `VITE_DEMO_CONTENT=true`.

With it off, those collections are empty and the sections render their designed
empty state or omit themselves. That is the correct production behaviour until
real, consented people and real reviews exist. A production build with the flag
on prints a warning to the console.

`.env.example` ships with it **off**. The local `.env` has it on so the design can
be reviewed.

---

## Running it

```bash
npm install
npm run dev:web          # http://localhost:5183
```

The public site runs with no backend. `VITE_API_MODE=fixtures` (the default)
resolves every read from `frontend/src/content` through the same API client and
the same `{ data, error, meta }` envelope the real API will use, so switching to
`live` is a transport change rather than a rewrite.

```bash
npm run build            # client + SSR bundle + prerender + sitemap
npm test                 # 423 tests across shared and frontend
npm run typecheck
```

### Other commands

```bash
npm run db:up            # Postgres, Redis and MinIO in Docker (Phase 2)
npm run fonts --workspace=frontend   # re-fetch and self-host the font files
```

---

## Layout

```
/frontend   React app - public website, and later the admin portal at /admin/*
/backend    Node API (scaffolded, not built)
/shared     Design tokens, Zod schemas, TypeScript types, UI primitives
/mobile     Reserved for a future React Native app on the same API
```

`shared` has no React at its root export, so the Node API can import schemas and
tokens without pulling a UI dependency into the server bundle. Components live
behind the `./ui` subpath.

---

## The design system

`shared/src/tokens/theme.css` is the single source of truth. It is a Tailwind v4
`@theme` block that **clears the stock palette, radius, weight and type scales to
`initial`**. `bg-blue-500`, `rounded-lg` and `font-bold` do not exist in this
codebase - writing one produces no class at all, and a test fails the build.

The load-bearing distinction:

- **pewter is structural** - hairlines, quiet metadata, inactive states. It never
  carries meaning, and never a verification badge: a grey badge reads as
  disabled, not as trusted.
- **brass is semantic** - it appears on the verification badge and on one
  headline price, and nowhere else.

### Four derived tokens, and why they exist

The specified palette does not meet the WCAG 2.1 AA the spec also requires. Four
darker stops close the gap. Each is derived from a colour already in the system,
following the spec's own rule that text on a coloured surface takes a darker stop
from the same family. `shared/src/tokens/tokens.test.ts` proves all of it.

| Token | Why |
|---|---|
| `--color-brass-text` `#6b5426` | brass measures 4.40:1 on paper - a mark, not a text colour |
| `--color-pewter-text` `#3b4252` | pewter measures 2.87:1 on paper; 13px metadata still owes 4.5:1 |
| `--color-pewter-strong` `#79849b` | `--line` at 1.24:1 is a divider; WCAG 1.4.11 asks 3:1 of a control boundary |
| `--color-attention-text` `#a34914` | attention on its own tint measures 4.47:1, three hundredths short |

Two further judgement calls are recorded in code comments where they apply:

- The secondary-on-dark button border uses pewter, not `--ink-soft`. Ink-soft
  measures 2.33:1 on midnight, which leaves the button edge invisible.
- Prices in a list or a table are ink, not brass. The spec names brass for a
  published price *and* caps brass at twice per viewport; a catalogue grid of
  eight cards would put eight brass figures on screen. Scarcity wins, because it
  is what makes brass mean anything.

---

## What is real and what is not

**Real:** the service catalogue, coverage data, six full-length articles, four
job listings, all page copy, the pincode check, the four-step booking flow, the
two-track professional application, prerendering, the sitemap.

**Placeholder, and marked as such in the file that holds it:**

- The phone number, email and office address (`brand.ts`)
- The professional profiles, leadership team and reviews (`VITE_DEMO_CONTENT`)
- The hero photograph. The slot states what belongs there rather than filling it
  with stock imagery, which this near-neutral palette would collapse under.
  Set `brand.heroImage` to a path under /public and the `<img>` path takes over,
  same 4:3 box, dimensions reserved, nothing else changes.
- The logo, which cannot be designed until there is a name to design it around
- The terms and privacy pages, which carry a visible "pending legal review"
  notice. Confirm the clinical establishment registration and DPDP Act
  obligations with counsel before launch.

---

## Known gaps

- **Prerendered content is the page shell.** Titles, meta descriptions, canonical
  URLs, OG tags and JSON-LD are all correct per route in the static HTML. The
  API-driven card content is not, because data loading is effect-based and does
  not run during `renderToStaticMarkup`. Crawlers execute JS and will index it;
  closing this properly means moving reads to a Suspense resource.
- **375px has not been verified in a browser.** The layout is mobile-first and
  every route was checked for horizontal overflow, but at desktop width - the
  browser tooling here would not hold a narrow viewport. Worth ten minutes in
  responsive mode before shipping.
- **Lighthouse has not been run.**
- `npm audit` reports four advisories, all inside the Prisma **CLI**
  (`mysql2`, `deepmerge-ts`). This is a Postgres project, the MySQL driver is
  never loaded, and the CLI never ships. The offered fix downgrades Prisma 7 to
  6, which is the larger risk.

---

## Phase 2 and 3

Not started. The data model in the spec should be created in full before the
admin portal is built, since migrating a live booking table is expensive. The
schemas in `shared/src/schemas` already describe the booking and application
payloads and are written to be imported by both the form and the endpoint, so a
rule cannot be tightened in one place and left loose in the other.

Five decisions are still open and each changes the data model: supply model,
pricing model, launch geography (currently multi-city-capable), payment timing,
and whether a professional-facing mobile app lands within a year.
