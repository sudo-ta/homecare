/**
 * The demo-content gate.
 *
 * Three kinds of content on this site are claims about real people: the
 * professional profiles, the leadership team, and the reviews. Spec 6.2 is
 * blunt about the last one - "a review that could plausibly describe any
 * business is worse than no review" - and the trust band carries the same rule:
 * if a figure is not real, omit the slot.
 *
 * Invented nurses and invented testimonials on a live home healthcare site
 * would mislead a family choosing who to let into their house, so they cannot
 * be allowed to ship by accident. Everything written by hand below is served
 * only when this flag is explicitly on. With it off - which is the default
 * everywhere except a developer's machine - those collections are empty and
 * the sections that read them render their designed empty state or omit
 * themselves.
 *
 * Turning it on for a production build is a deliberate act, and the build
 * prints a warning when it happens.
 */
export const SHOW_DEMO_CONTENT: boolean = import.meta.env.VITE_DEMO_CONTENT === 'true';

/** Wraps a demo-only collection. Returns [] unless the gate is open. */
export function demoOnly<T>(items: T[]): T[] {
  return SHOW_DEMO_CONTENT ? items : [];
}
