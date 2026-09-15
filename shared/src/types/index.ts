/**
 * Domain types, shared by the web frontend, the API and the future mobile app.
 *
 * These mirror the entities in spec 7.1. They are the API's camelCase shape,
 * not the database's snake_case shape - Prisma maps between the two.
 */

export type ServiceCategory =
  | 'nursing'
  | 'caregiving'
  | 'physiotherapy'
  | 'doctor-visit'
  | 'diagnostics'
  | 'equipment';

export type PriceUnit = 'per-visit' | 'per-hour' | 'per-12-hour-shift' | 'per-24-hour' | 'per-month';

export type DurationPattern =
  | 'single-visit'
  | 'hourly'
  | 'twelve-hour'
  | 'twenty-four-hour'
  | 'monthly';

export type Urgency = 'today' | 'within-2-days' | 'planning-ahead' | 'specific-date';

export type MobilityLevel = 'independent' | 'needs-support' | 'bed-bound' | 'wheelchair';

export type Gender = 'female' | 'male' | 'other' | 'prefer-not-to-say';

export type ProfessionalRole =
  | 'nurse'
  | 'caregiver'
  | 'physiotherapist'
  | 'doctor'
  | 'institution';

export type ProfessionalStatus =
  | 'applied'
  | 'under_review'
  | 'verified'
  | 'active'
  | 'suspended'
  | 'rejected';

export type BookingStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'quoted'
  | 'confirmed'
  | 'assigned'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'lost';

export type LeadSource = 'contact' | 'coverage_waitlist' | 'hero_check';

export interface Service {
  id: string;
  slug: string;
  category: ServiceCategory;
  name: string;
  /** One line. Used on the home page card and in meta descriptions. */
  summary: string;
  description: string;
  inclusions: string[];
  /** Spec 6.3 requires saying plainly what a service does NOT cover. */
  exclusions: string[];
  /** Who this suits, in the reader's terms. */
  suitableFor: string[];
  qualificationRequired: string;
  durationOptions: DurationPattern[];
  basePrice: number;
  priceUnit: PriceUnit;
  /** What moves the final price away from the starting figure. */
  priceFactors: string[];
  faqs: { question: string; answer: string }[];
  isActive: boolean;
  displayOrder: number;
}

export interface ServiceArea {
  id: string;
  city: string;
  citySlug: string;
  locality: string;
  pincode: string;
  isActive: boolean;
  /** Service slugs available here. Empty means every active service. */
  serviceSlugs: string[];
}

export interface CoverageResult {
  pincode: string;
  covered: boolean;
  city?: string;
  citySlug?: string;
  locality?: string;
  /** Services available at this pincode, in display order. */
  services: Service[];
  /** Populated when the pincode is not covered: the closest ones that are. */
  nearbyCovered?: { pincode: string; locality: string; city: string }[];
}

export interface Professional {
  id: string;
  fullName: string;
  role: ProfessionalRole;
  /** Shown as "8 years" on the profile card. */
  experienceYears: number;
  qualification: string;
  languages: string[];
  citySlug: string;
  areas: string[];
  /** null until a real photograph is supplied. The UI renders initials, never a stock face. */
  photoUrl: string | null;
  /** Public-safe summary. No contact details are ever exposed publicly. */
  bio: string;
  /** What was actually checked, so the badge means something specific. */
  verifiedChecks: string[];
  status: ProfessionalStatus;
  serviceSlugs: string[];
}

export interface Review {
  id: string;
  /** First name and last initial. Real attribution, not "A happy family". */
  author: string;
  city: string;
  /** Spec 6.2: a review must name the service it is about. */
  serviceSlug: string;
  serviceName: string;
  rating: number;
  body: string;
  /** ISO date. */
  publishedAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown-lite: paragraphs, headings, lists. Rendered by the article page. */
  body: string;
  coverImage: string | null;
  author: string;
  authorRole: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  isPublished: boolean;
}

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'visit-based';
  description: string;
  requirements: string[];
  isOpen: boolean;
  postedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Spec 6.6 wants named people with photographs, not stock silhouettes. */
  photoUrl: string | null;
  bio: string;
  credentials: string[];
}

/* -------------------------------------------------------------------------
 * API envelope (spec 3)
 * ---------------------------------------------------------------------- */

export interface ApiError {
  /** Stable and machine-readable. Never just a message string. */
  code: string;
  message: string;
  /** Field-level problems, keyed by dotted path. */
  surfaces?: Record<string, string[]>;
}

export interface ApiMeta {
  requestId?: string;
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}
