import { brand } from '@shared/brand.js';

export interface SeoProps {
  title: string;
  description: string;
  /** Path only, leading slash. Combined with the origin for the canonical URL. */
  path: string;
  /** Absolute or root-relative image for social cards. */
  image?: string;
  /** Adds noindex. Use for confirmation screens, which must not be indexed. */
  noindex?: boolean;
  /** JSON-LD objects for this page, beyond the site-wide organisation schema. */
  structuredData?: object[];
}

const ORIGIN: string = import.meta.env.VITE_SITE_ORIGIN ?? 'http://localhost:5183';

/**
 * Per-page metadata.
 *
 * React 19 hoists <title>, <meta> and <link> to the document head from
 * anywhere in the tree, so this needs no helmet library and works unchanged
 * when the public pages are prerendered for spec 9's SEO requirement.
 */
export function Seo({ title, description, path, image, noindex, structuredData = [] }: SeoProps) {
  const canonical = `${ORIGIN}${path}`;
  const social = image ? (image.startsWith('http') ? image : `${ORIGIN}${image}`) : undefined;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={brand.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      {social ? <meta property="og:image" content={social} /> : null}

      <meta name="twitter:card" content={social ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {structuredData.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Controlled, non-user content built by buildSchema below.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------
 * Structured data builders (spec 9)
 * ---------------------------------------------------------------------- */

/** MedicalBusiness, scoped to one city when given, else the whole brand. */
export function medicalBusinessSchema(citySlug?: string): object {
  const city = citySlug ? brand.cities.find((c) => c.slug === citySlug) : undefined;
  const addr = brand.contact.address;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: city ? `${brand.name} - ${city.name}` : brand.name,
    description: brand.strapline,
    url: city ? `${ORIGIN}/home-nursing-${city.slug}` : ORIGIN,
    telephone: brand.contact.phoneE164,
    email: brand.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${addr.line1}, ${addr.line2}`,
      addressLocality: city?.name ?? addr.city,
      addressRegion: city?.state ?? addr.state,
      postalCode: addr.pincode,
      addressCountry: addr.country,
    },
    ...(city
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: city.geo.lat,
            longitude: city.geo.lng,
          },
          areaServed: { '@type': 'City', name: city.name },
        }
      : {
          areaServed: brand.cities
            .filter((c) => c.isLaunched)
            .map((c) => ({ '@type': 'City', name: c.name })),
        }),
    openingHoursSpecification: brand.contact.isPhoneStaffedAllHours
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        ]
      : undefined,
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  slug: string;
  price: number;
  priceUnit: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: input.name,
    name: input.name,
    description: input.description,
    url: `${ORIGIN}/services/${input.slug}`,
    provider: { '@type': 'MedicalBusiness', name: brand.name, telephone: brand.contact.phoneE164 },
    areaServed: brand.cities
      .filter((c) => c.isLaunched)
      .map((c) => ({ '@type': 'City', name: c.name })),
    offers: {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: 'INR',
      description: `Starting price, ${input.priceUnit}`,
    },
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedAt: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: `${ORIGIN}/blog/${input.slug}`,
    author: { '@type': 'Person', name: input.author },
    publisher: { '@type': 'Organization', name: brand.name },
    datePublished: input.publishedAt,
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${ORIGIN}${t.path}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
