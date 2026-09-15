/**
 * TypeScript mirror of theme.css.
 *
 * CSS is the source of truth for anything the browser renders. This mirror
 * exists for the places CSS cannot reach: email templates (which need literal
 * hex), the prerender pass, structured data, and the contrast test.
 *
 * tokens.test.ts asserts these stay in step with theme.css, so a colour edited
 * in one file and not the other fails the build rather than drifting.
 */

export const colors = {
  ink: '#10141f',
  inkSoft: '#4e5566',

  midnight: '#151a28',
  midnightLo: '#e3e6ec',

  /** Structural only: rules, inactive states. Never text, never a badge. */
  pewter: '#8892a6',
  pewterLo: '#edeff3',

  /** Semantic only: verification and the focus ring. */
  brass: '#8a6e3c',
  brassLo: '#f3ede1',

  paper: '#f4f5f7',
  surface: '#ffffff',
  /** Hairline dividers. Interactive boundaries take pewterStrong. */
  line: '#dadee5',

  positive: '#2f6f4e',
  positiveLo: '#e9f2ed',
  attention: '#b4541c',
  attentionLo: '#f8ece2',
  critical: '#9b2c2c',
  criticalLo: '#f9ecec',

  /* Derived stops. See the note in theme.css for the measurements. */
  brassText: '#6b5426',
  pewterText: '#3b4252',
  pewterStrong: '#79849b',
  attentionText: '#a34914',

  /* The accent family this revision introduces. Blue is the only hue that
     carries meaning outside brass: it marks the step numbers, the inclusion
     ticks and the active nav link, and it fills the primary action. Brass
     stays reserved for verification, so the two never compete.

     accent measures 6.96:1 on white and 6.38:1 on paper, so it is safe as
     text. navy is a near-black fill: white reverses out of it at 18.9:1. */
  accent: '#3056a7',
  accentDeep: '#22417f',
  navy: '#000b33',
  navyHover: '#001a5c',

  /* The booking flow's blue, introduced with Booking.dc.html and now the hero's
     top stop too. Deeper and more saturated than accent: 9.23:1 on white, so
     white type over the hero clears AAA without depending on a blurred orb. */
  blue: '#1a4199',
  blueDeep: '#0d2f7d',

  /* The gradient hero. The one saturated moment on the page. */
  sky1: '#1a4199',
  sky2: '#24489b',
  sky3: '#33559f',
  sky4: '#4d6cad',
  sky5: '#7591c3',
  sky6: '#a9bedc',
  skyDeep: '#0d2f7d',
  skyWarm: '#f2ddc6',
} as const;

export type ColorToken = keyof typeof colors;

/** Light backgrounds text is allowed to sit on. The contrast test sweeps all. */
export const textSurfaces = ['paper', 'surface', 'midnightLo', 'pewterLo', 'brassLo'] as const;

export const fonts = {
  display: '"Newsreader", "Noto Sans Devanagari", "Noto Sans Gujarati", Georgia, serif',
  sans: '"Instrument Sans", "Noto Sans Devanagari", "Noto Sans Gujarati", system-ui, -apple-system, sans-serif',
} as const;

export const typeScale = {
  display: { min: 2.375, max: 3.875, leading: 1.04, tracking: -0.04, weight: 400 },
  h1: { min: 1.875, max: 3, leading: 1.06, tracking: -0.035, weight: 400 },
  h2: { min: 1.875, max: 2.5, leading: 1.08, tracking: -0.035, weight: 400 },
  h3: { min: 1.375, max: 1.375, leading: 1.3, tracking: 0, weight: 400 },
  price: { min: 1.875, max: 2.375, leading: 1.05, tracking: -0.03, weight: 400 },
  bodyLg: { min: 1.1875, max: 1.1875, leading: 1.6, tracking: 0, weight: 400 },
  body: { min: 1.0625, max: 1.0625, leading: 1.65, tracking: 0, weight: 400 },
  small: { min: 0.9375, max: 0.9375, leading: 1.5, tracking: 0, weight: 400 },
  meta: { min: 0.8125, max: 0.8125, leading: 1.5, tracking: 0, weight: 400 },
} as const;

/** Hierarchical, not uniform: actions are pills, surfaces are not. */
export const radius = {
  control: '8px',
  card: '8px',
  panel: '16px',
  feature: '24px',
  media: '40px',
  pill: '9999px',
} as const;

export const motion = {
  easeSignature: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeReveal: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeState: 'cubic-bezier(0.2, 0, 0.2, 1)',
  easeFloat: 'cubic-bezier(0.37, 0, 0.63, 1)',
  durHover: 150,
  durState: 220,
  durPanel: 320,
  durReveal: 600,
  durSignature: 900,
} as const;

export const layout = {
  containerMax: 1296,
  headerMax: 1120,
  gutterMobile: 24,
  gutterDesktop: 48,
  sectionYMobile: 64,
  sectionYDesktop: 112,
  measureCh: 68,
  minHitArea: 48,
} as const;

export const breakpoints = {
  base: 375,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/* -------------------------------------------------------------------------
 * Contrast
 * ---------------------------------------------------------------------- */

function channel(hex: string, from: number): number {
  const v = parseInt(hex.slice(from, from + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return 0.2126 * channel(full, 0) + 0.7152 * channel(full, 2) + 0.0722 * channel(full, 4);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

export const WCAG = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AA_NON_TEXT: 3,
} as const;
