import type { ServiceArea } from '@shared/types/index.js';

/**
 * Coverage seed data.
 *
 * IMPORTANT: these pincode-to-locality pairings are seed content for the
 * catalogue and must be confirmed against where operations can actually staff a
 * shift before launch. The pincode check is the first promise the site makes to
 * a stressed reader at 11pm, and a wrong yes is worse than an honest no.
 *
 * A Content Editor maintains this list in the admin portal once Phase 3 lands.
 * `serviceSlugs: []` means every active service is available in that locality.
 */
export const serviceAreas: ServiceArea[] = [
  // --- Ahmedabad -----------------------------------------------------------
  { id: 'sa-380001', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Lal Darwaja and Khadia', pincode: '380001', isActive: true, serviceSlugs: [] },
  { id: 'sa-380006', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Ellisbridge', pincode: '380006', isActive: true, serviceSlugs: [] },
  { id: 'sa-380007', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Paldi', pincode: '380007', isActive: true, serviceSlugs: [] },
  { id: 'sa-380008', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Maninagar', pincode: '380008', isActive: true, serviceSlugs: [] },
  { id: 'sa-380009', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Navrangpura', pincode: '380009', isActive: true, serviceSlugs: [] },
  { id: 'sa-380013', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Naranpura', pincode: '380013', isActive: true, serviceSlugs: [] },
  { id: 'sa-380015', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Ambawadi', pincode: '380015', isActive: true, serviceSlugs: [] },
  { id: 'sa-380051', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Vastrapur', pincode: '380051', isActive: true, serviceSlugs: [] },
  { id: 'sa-380052', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Sola', pincode: '380052', isActive: true, serviceSlugs: [] },
  { id: 'sa-380054', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Thaltej', pincode: '380054', isActive: true, serviceSlugs: [] },
  { id: 'sa-380058', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Bopal', pincode: '380058', isActive: true, serviceSlugs: [] },
  { id: 'sa-380059', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Ghatlodia', pincode: '380059', isActive: true, serviceSlugs: [] },
  { id: 'sa-380061', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Chandlodia', pincode: '380061', isActive: true, serviceSlugs: [] },
  {
    id: 'sa-382424',
    city: 'Ahmedabad',
    citySlug: 'ahmedabad',
    locality: 'Chandkheda',
    pincode: '382424',
    isActive: true,
    // Outer localities: nursing and caregiving are staffed, the rest are not yet.
    serviceSlugs: ['home-nursing', 'post-surgery-care', 'elderly-caregiver', 'physiotherapy-at-home'],
  },
  {
    id: 'sa-382481',
    city: 'Ahmedabad',
    citySlug: 'ahmedabad',
    locality: 'Gota',
    pincode: '382481',
    isActive: true,
    serviceSlugs: ['home-nursing', 'post-surgery-care', 'elderly-caregiver', 'physiotherapy-at-home'],
  },
  {
    id: 'sa-382350',
    city: 'Ahmedabad',
    citySlug: 'ahmedabad',
    locality: 'Naroda',
    pincode: '382350',
    isActive: true,
    serviceSlugs: ['home-nursing', 'elderly-caregiver'],
  },

  // --- Vadodara ------------------------------------------------------------
  { id: 'sa-390001', city: 'Vadodara', citySlug: 'vadodara', locality: 'Raopura', pincode: '390001', isActive: true, serviceSlugs: [] },
  { id: 'sa-390007', city: 'Vadodara', citySlug: 'vadodara', locality: 'Alkapuri', pincode: '390007', isActive: true, serviceSlugs: [] },
  { id: 'sa-390011', city: 'Vadodara', citySlug: 'vadodara', locality: 'Fatehgunj', pincode: '390002', isActive: true, serviceSlugs: [] },
  {
    id: 'sa-390020',
    city: 'Vadodara',
    citySlug: 'vadodara',
    locality: 'Manjalpur',
    pincode: '390020',
    isActive: true,
    serviceSlugs: ['home-nursing', 'post-surgery-care', 'elderly-caregiver', 'physiotherapy-at-home', 'doctor-visit-at-home'],
  },
  {
    id: 'sa-390021',
    city: 'Vadodara',
    citySlug: 'vadodara',
    locality: 'Gotri',
    pincode: '390021',
    isActive: true,
    serviceSlugs: ['home-nursing', 'post-surgery-care', 'elderly-caregiver', 'physiotherapy-at-home', 'doctor-visit-at-home'],
  },
  {
    id: 'sa-390023',
    city: 'Vadodara',
    citySlug: 'vadodara',
    locality: 'Akota',
    pincode: '390020',
    isActive: true,
    serviceSlugs: ['home-nursing', 'elderly-caregiver', 'physiotherapy-at-home'],
  },

  // --- Planned, not yet staffed -------------------------------------------
  // Shown on /coverage as explicitly not covered, with waitlist capture, rather
  // than hidden. Spec 6.6 is explicit about this.
  { id: 'sa-382421', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Sanand', pincode: '382110', isActive: false, serviceSlugs: [] },
  { id: 'sa-382445', city: 'Ahmedabad', citySlug: 'ahmedabad', locality: 'Vatva', pincode: '382445', isActive: false, serviceSlugs: [] },
  { id: 'sa-391740', city: 'Vadodara', citySlug: 'vadodara', locality: 'Padra', pincode: '391440', isActive: false, serviceSlugs: [] },
];

export const activeAreas = (): ServiceArea[] => serviceAreas.filter((a) => a.isActive);

export const areasByCity = (citySlug: string): ServiceArea[] =>
  serviceAreas
    .filter((a) => a.citySlug === citySlug)
    .sort((a, b) => a.locality.localeCompare(b.locality));

export const findArea = (pincode: string): ServiceArea | undefined =>
  serviceAreas.find((a) => a.pincode === pincode && a.isActive);

/** Numerically closest covered pincodes, used when a check comes back negative. */
export const nearestCovered = (pincode: string, limit = 3): ServiceArea[] => {
  const target = Number(pincode);
  if (!Number.isFinite(target)) return [];
  return activeAreas()
    .map((a) => ({ area: a, distance: Math.abs(Number(a.pincode) - target) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((x) => x.area);
};
