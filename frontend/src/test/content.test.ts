import { describe, expect, it } from 'vitest';
import { articles, publishedArticles } from '@/content/articles.js';
import { openJobs } from '@/content/jobs.js';
import { activeAreas, findArea, nearestCovered, serviceAreas } from '@/content/serviceAreas.js';
import { activeServices, serviceBySlug, services } from '@/content/services.js';

/**
 * Content rules that spec 6 and 10 state as conditions of shipping, checked
 * against the actual catalogue rather than trusted to review.
 */

describe('the service catalogue', () => {
  it('has the six to eight categories the home page expects', () => {
    expect(activeServices().length).toBeGreaterThanOrEqual(6);
    expect(activeServices().length).toBeLessThanOrEqual(8);
  });

  it('gives every service a unique slug', () => {
    const slugs = services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(services.map((s) => [s.slug, s] as const))(
    '%s says what it does not cover',
    (_slug, service) => {
      // Spec 6.3 requires the exclusions, and they are what stop a booking
      // turning into an argument later.
      expect(service.exclusions.length).toBeGreaterThan(0);
      expect(service.inclusions.length).toBeGreaterThan(0);
      expect(service.suitableFor.length).toBeGreaterThan(0);
    },
  );

  it.each(services.map((s) => [s.slug, s] as const))(
    '%s publishes a price and what moves it',
    (_slug, service) => {
      expect(service.basePrice).toBeGreaterThan(0);
      expect(service.priceFactors.length).toBeGreaterThan(0);
    },
  );

  it('orders the catalogue deterministically', () => {
    const order = activeServices().map((s) => s.displayOrder);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('resolves a known slug and rejects an unknown one', () => {
    expect(serviceBySlug('home-nursing')?.name).toBe('Home nursing');
    expect(serviceBySlug('not-a-service')).toBeUndefined();
  });
});

describe('coverage lookup', () => {
  it('finds a covered pincode', () => {
    const area = findArea('380009');
    expect(area?.city).toBe('Ahmedabad');
    expect(area?.locality).toBe('Navrangpura');
  });

  it('does not treat a planned area as covered', () => {
    // Sanand is seeded as isActive: false, and /coverage shows it explicitly
    // as not covered rather than hiding it.
    const planned = serviceAreas.find((a) => a.locality === 'Sanand');
    expect(planned?.isActive).toBe(false);
    expect(findArea(planned!.pincode)).toBeUndefined();
  });

  it('suggests the nearest covered pincodes when a check fails', () => {
    const near = nearestCovered('382110', 3);
    expect(near).toHaveLength(3);
    expect(near.every((a) => a.isActive)).toBe(true);
  });

  it('covers both launched cities', () => {
    const cities = new Set(activeAreas().map((a) => a.citySlug));
    expect(cities).toContain('ahmedabad');
    expect(cities).toContain('vadodara');
  });
});

describe('the blog', () => {
  it('ships at least the six genuine articles spec 6.6 requires', () => {
    expect(publishedArticles().length).toBeGreaterThanOrEqual(6);
  });

  it('gives every article a unique slug', () => {
    const slugs = articles.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has real bodies, not placeholders', () => {
    for (const a of publishedArticles()) {
      expect(a.body.length).toBeGreaterThan(800);
      expect(a.body.toLowerCase()).not.toContain('lorem ipsum');
      expect(a.excerpt.length).toBeGreaterThan(40);
    }
  });

  it('sorts newest first', () => {
    const dates = publishedArticles().map((a) => a.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe('the copy voice rules in spec 5.7', () => {
  const allCopy = [
    ...services.flatMap((s) => [
      s.name,
      s.summary,
      s.description,
      ...s.inclusions,
      ...s.exclusions,
      ...s.suitableFor,
      ...s.priceFactors,
      ...s.faqs.flatMap((f) => [f.question, f.answer]),
    ]),
    ...articles.flatMap((a) => [a.title, a.excerpt, a.body]),
    ...openJobs().flatMap((j) => [j.title, j.description, ...j.requirements]),
  ];

  it('never says "loved one"', () => {
    // Spec 5.7 calls it the cliche of this entire industry.
    const offenders = allCopy.filter((t) => /loved ones?\b/i.test(t));
    expect(offenders).toEqual([]);
  });

  it('uses no exclamation marks outside success confirmations', () => {
    const offenders = allCopy.filter((t) => t.includes('!'));
    expect(offenders).toEqual([]);
  });

  it('uses no em or en dashes', () => {
    const offenders = allCopy.filter((t) => /[–—]/.test(t));
    expect(offenders).toEqual([]);
  });
});

describe('open roles', () => {
  it('lists only roles that are open', () => {
    expect(openJobs().every((j) => j.isOpen)).toBe(true);
  });

  it('gives every role real requirements', () => {
    for (const j of openJobs()) {
      expect(j.requirements.length).toBeGreaterThanOrEqual(3);
      expect(j.description.length).toBeGreaterThan(80);
    }
  });
});
