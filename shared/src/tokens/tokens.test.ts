import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { colors, contrastRatio, textSurfaces, WCAG, type ColorToken } from './index.js';

const themeCss = readFileSync(fileURLToPath(new URL('./theme.css', import.meta.url)), 'utf8');

/** --color-ink-soft -> inkSoft, --color-sky-1 -> sky1 */
const toCamel = (kebab: string) =>
  kebab.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

describe('theme.css and the TypeScript mirror agree', () => {
  const declared = new Map<string, string>();
  const themeBlock = themeCss.slice(themeCss.indexOf('@theme'), themeCss.indexOf('@layer base'));
  for (const [, name, value] of themeBlock.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6});/g)) {
    if (name && value) declared.set(toCamel(name), value);
  }

  it('declares every colour the mirror exports', () => {
    expect([...declared.keys()].sort()).toEqual(Object.keys(colors).sort());
  });

  it.each(Object.entries(colors))('%s matches', (name, hex) => {
    expect(declared.get(name)).toBe(hex);
  });
});

describe('the palette matches the imported design', () => {
  it('holds every imported value exactly', () => {
    // Read straight off the second revision of Home Care Site.dc.html, which
    // was rebuilt against this codebase and carries our palette verbatim.
    expect(colors.ink).toBe('#10141f');
    expect(colors.inkSoft).toBe('#4e5566');
    expect(colors.midnight).toBe('#151a28');
    expect(colors.midnightLo).toBe('#e3e6ec');
    expect(colors.pewter).toBe('#8892a6');
    expect(colors.pewterLo).toBe('#edeff3');
    expect(colors.brass).toBe('#8a6e3c');
    expect(colors.brassLo).toBe('#f3ede1');
    expect(colors.paper).toBe('#f4f5f7');
    expect(colors.surface).toBe('#ffffff');
    expect(colors.line).toBe('#dadee5');
    expect(colors.positive).toBe('#2f6f4e');
    expect(colors.critical).toBe('#9b2c2c');
  });

  it('keeps the page off-white rather than pure white', () => {
    expect(colors.paper).not.toBe('#ffffff');
  });
});

describe('WCAG 2.1 AA, which remains a functional requirement', () => {
  const ratio = (fg: ColorToken, bg: ColorToken) => contrastRatio(colors[fg], colors[bg]);

  describe.each(textSurfaces)('on %s', (surface) => {
    it('body text reaches AAA', () => {
      expect(ratio('ink', surface)).toBeGreaterThanOrEqual(WCAG.AAA_NORMAL);
    });

    it('secondary text reaches AA', () => {
      expect(ratio('inkSoft', surface)).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('headings reach AA', () => {
      expect(ratio('midnight', surface)).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('metadata text reaches AA', () => {
      expect(ratio('pewterText', surface)).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('brass-coloured text reaches AA', () => {
      expect(ratio('brassText', surface)).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('the focus ring reaches the 3:1 of WCAG 1.4.11', () => {
      expect(ratio('brass', surface)).toBeGreaterThanOrEqual(WCAG.AA_NON_TEXT);
    });

    it('interactive control borders reach the 3:1 of WCAG 1.4.11', () => {
      expect(ratio('pewterStrong', surface)).toBeGreaterThanOrEqual(WCAG.AA_NON_TEXT);
    });
  });

  describe('the dark midnight band', () => {
    it('carries its heading at AAA', () => {
      expect(ratio('paper', 'midnight')).toBeGreaterThanOrEqual(WCAG.AAA_NORMAL);
    });

    it('carries body copy at AA', () => {
      expect(ratio('midnightLo', 'midnight')).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('takes the focus ring, which is why the ring is brass', () => {
      expect(ratio('brass', 'midnight')).toBeGreaterThanOrEqual(WCAG.AA_NON_TEXT);
    });

    it('shows a secondary button border', () => {
      // The design uses --pewter here. Ink-soft would measure 2.33:1 and leave
      // the edge invisible.
      expect(ratio('pewter', 'midnight')).toBeGreaterThanOrEqual(WCAG.AA_NON_TEXT);
      expect(ratio('inkSoft', 'midnight')).toBeLessThan(WCAG.AA_NON_TEXT);
    });
  });

  describe('the gradient hero', () => {
    // White text over the gradient, and a white focus ring, because brass does
    // not clear 3:1 against the saturated blue at the top of it.
    it('carries white text at AAA over its darkest stop', () => {
      expect(contrastRatio('#ffffff', colors.sky1)).toBeGreaterThanOrEqual(WCAG.AAA_NORMAL);
    });

    it('carries white text at AA over its lightest coloured stop', () => {
      expect(contrastRatio('#ffffff', colors.sky4)).toBeGreaterThanOrEqual(WCAG.AA_LARGE);
    });

    it('needs a white ring, since brass does not hold against the blue', () => {
      expect(contrastRatio(colors.brass, colors.sky1)).toBeLessThan(WCAG.AA_NON_TEXT);
      expect(contrastRatio('#ffffff', colors.sky1)).toBeGreaterThanOrEqual(WCAG.AA_NON_TEXT);
    });
  });

  describe('filled controls', () => {
    it('reverses a label out of the midnight fill at AAA', () => {
      expect(ratio('paper', 'midnight')).toBeGreaterThanOrEqual(WCAG.AAA_NORMAL);
    });

    it('reverses a label out of a destructive fill at AA', () => {
      expect(ratio('paper', 'critical')).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });
  });

  describe('semantic text on its own tint', () => {
    it.each([
      ['positive', 'positiveLo'],
      ['attentionText', 'attentionLo'],
      ['critical', 'criticalLo'],
    ] as [ColorToken, ColorToken][])('%s on %s reaches AA', (fg, bg) => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(WCAG.AA_NORMAL);
    });

    it('keeps every tint distinguishable from the page', () => {
      for (const t of ['positiveLo', 'attentionLo', 'criticalLo', 'midnightLo', 'pewterLo'] as const) {
        expect(ratio(t, 'paper')).toBeGreaterThan(1.02);
      }
    });
  });
});

describe('the shape and type rules this revision brings', () => {
  it('is rounded again, and hierarchically rather than uniformly', () => {
    expect(themeCss).toContain('--radius-control: 8px;');
    expect(themeCss).toContain('--radius-feature: 24px;');
    expect(themeCss).toContain('--radius-media: 40px;');
    expect(themeCss).toContain('--radius-pill: 9999px;');
  });

  it('sets body text at 17px, not 16px', () => {
    expect(themeCss).toContain('--text-body: 1.0625rem;');
  });

  it('never generates a font-weight above 600', () => {
    const weights = [...themeCss.matchAll(/--font-weight-[a-z]+:\s*(\d+);/g)].map((m) => Number(m[1]));
    expect(weights.length).toBeGreaterThan(0);
    expect(Math.max(...weights)).toBeLessThanOrEqual(600);
  });

  it('tracks the display sizes negatively', () => {
    expect(themeCss).toContain('--text-display--letter-spacing: -0.04em');
    expect(themeCss).toContain('--text-h2--letter-spacing: -0.035em');
  });

  it('sizes display type fluidly so it holds shape without a breakpoint', () => {
    expect(themeCss).toMatch(/--text-display: clamp\(/);
    expect(themeCss).toMatch(/--text-h2: clamp\(/);
  });

  it('carries a large display-face price size', () => {
    expect(themeCss).toContain('--text-price');
  });

  it('clears the stock Tailwind scales', () => {
    expect(themeCss).toContain('--color-*: initial;');
    expect(themeCss).toContain('--radius-*: initial;');
    expect(themeCss).toContain('--shadow-*: initial;');
    expect(themeCss).toContain('--text-*: initial;');
  });

  it('holds desktop section rhythm at 112px', () => {
    expect(themeCss).toMatch(/\.section-y\s*\{\s*padding-block:\s*7rem;/);
  });
});
