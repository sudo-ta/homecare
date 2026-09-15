/**
 * THE SWAP POINT.
 *
 * Every brand-facing string in the product resolves from this file. To rebrand,
 * edit this file and nothing else - no page, component, email template, seed
 * file or meta tag hardcodes the name, city, phone number or address.
 *
 * Values marked PLACEHOLDER are working stand-ins, not real. Replace them
 * before anything is shown to a real visitor. Nothing here is invented as
 * though it were verified fact: counts, affiliations and response times that
 * the business has not actually committed to are left null on purpose, and the
 * UI omits the slot rather than printing a number that is not true.
 */

export interface BrandCity {
  /** URL segment: /home-nursing-ahmedabad */
  slug: string;
  name: string;
  state: string;
  /** Shown in local business structured data. */
  region: string;
  /** Rough centre, for the local business schema and the coverage map. */
  geo: { lat: number; lng: number };
  isLaunched: boolean;
}

export const brand = {
  /**
   * PLACEHOLDER. The name is not decided.
   *
   * Left as a bracketed token on purpose so it is obvious in every screenshot,
   * page title and email that this is still open, rather than a plausible
   * working name quietly becoming the real one by default.
   */
  name: '[BRAND]',
  shortName: '[BRAND]',
  /** PLACEHOLDER - the registered entity, used in legal pages and invoices. */
  legalName: '[BRAND] Private Limited',

  /** One line, used as the meta description fallback and the footer strapline. */
  strapline: 'Nurses, caregivers and physiotherapists who come to your home.',

  /**
   * The hero photograph.
   *
   * null renders the holding state in the hero. Set this to a path under
   * /public once there is a photograph - a care professional with a patient in
   * a real home, roughly 1200x900, AVIF or WebP.
   *
   * Think twice before pointing it at stock photography. Section 1 of the theme
   * spec is explicit that this near-neutral palette collapses under it, and a
   * smiling nurse on a white background makes the site look cheap rather than
   * expensive. If only stock is available, warm the palette to suit it.
   */
  heroImage: null as string | null,

  contact: {
    /** PLACEHOLDER. Display form, shown to the reader. */
    phoneDisplay: '+91 00000 00000',
    /** PLACEHOLDER. E.164, used for tel: links. Must stay in sync with the above. */
    phoneE164: '+910000000000',
    /** PLACEHOLDER. E.164 without the +, used for wa.me links. */
    whatsapp: '910000000000',
    /** PLACEHOLDER. */
    email: 'care@example.com',
    /** PLACEHOLDER. */
    careersEmail: 'join@example.com',
    /** PLACEHOLDER registered office. */
    address: {
      line1: '2nd Floor, Shivalik House',
      line2: 'Off C G Road, Navrangpura',
      locality: 'Navrangpura',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380009',
      country: 'IN',
    },
    /** Displayed on /contact. Keep true to what operations actually staff. */
    hours: [
      { days: 'Monday to Saturday', time: '8:00 am to 9:00 pm' },
      { days: 'Sunday', time: '9:00 am to 6:00 pm' },
    ],
    /** Emergency line is staffed outside those hours. */
    isPhoneStaffedAllHours: true,
  },

  /**
   * Multi-city switch.
   *
   * The data model, routing and content are city-scoped either way - this flag
   * only decides how much of that the visitor sees. Off: the city selector is
   * hidden and the site reads as a single-city service. On: the selector
   * appears in the header and the /home-nursing-[city] landing pages are
   * linked and indexed. Flipping it needs no migration.
   */
  multiCity: true,

  cities: [
    {
      slug: 'ahmedabad',
      name: 'Ahmedabad',
      state: 'Gujarat',
      region: 'GJ',
      geo: { lat: 23.0225, lng: 72.5714 },
      isLaunched: true,
    },
    {
      slug: 'vadodara',
      name: 'Vadodara',
      state: 'Gujarat',
      region: 'GJ',
      geo: { lat: 22.3072, lng: 73.1812 },
      isLaunched: true,
    },
  ] satisfies BrandCity[] as BrandCity[],

  /** Used when no city is in context: canonical URLs, default structured data. */
  defaultCitySlug: 'ahmedabad',

  /**
   * The callback window promised on the booking confirmation screen.
   * Spec 6.4: only acceptable copy if operations can actually meet it.
   * Set to null and the confirmation screen says "a coordinator will call you"
   * without committing to a number.
   */
  callbackMinutes: 30 as number | null,

  /**
   * Trust band figures. null means "we have not verified this" and the slot is
   * omitted from the page entirely rather than filled with a plausible number.
   */
  trust: {
    professionalCount: null as number | null,
    citiesServed: 2 as number | null,
    averageHoursToFirstVisit: null as number | null,
    hospitalAffiliations: [] as { name: string; logoUrl: string }[],
  },

  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
    youtube: null as string | null,
  },

  legal: {
    /** PLACEHOLDER. Clinical establishment registration, confirm with counsel. */
    clinicalEstablishmentRegNo: null as string | null,
    cin: null as string | null,
    /** Version string logged with every consent capture. Bump on any wording change. */
    consentTextVersion: '2026-09-15.1',
  },
} as const;

export type Brand = typeof brand;

export const getCity = (slug: string): BrandCity | undefined =>
  brand.cities.find((c) => c.slug === slug);

export const launchedCities = (): BrandCity[] => brand.cities.filter((c) => c.isLaunched);

/** tel: href. */
export const telHref = (): string => `tel:${brand.contact.phoneE164}`;

/** wa.me href with a prefilled message. */
export const whatsappHref = (message?: string): string => {
  const base = `https://wa.me/${brand.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
