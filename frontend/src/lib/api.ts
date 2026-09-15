import type {
  ApiResponse,
  Article,
  CoverageResult,
  JobOpening,
  Professional,
  Review,
  Service,
  TeamMember,
} from '@shared/types/index.js';
import { articleBySlug, publishedArticles } from '@/content/articles.js';
import { openJobs } from '@/content/jobs.js';
import { professionals, reviews, team } from '@/content/professionals.js';
import { activeAreas, findArea, nearestCovered } from '@/content/serviceAreas.js';
import { activeServices, serviceBySlug } from '@/content/services.js';
import type { ServiceArea } from '@shared/types/index.js';

/**
 * The API client.
 *
 * Spec 3 puts all business logic behind the API, and spec 1 requires the
 * backend to be the single source of truth so a future mobile app consumes the
 * same endpoints. Pages therefore never import content files directly - they
 * call this client, which speaks the `{ data, error, meta }` envelope.
 *
 * Two transports implement the same contract:
 *
 *   fixtures - resolves against the seed content in src/content. Lets the whole
 *              public site be built and reviewed before the API exists.
 *   live     - fetches /api/v1 on the same origin.
 *
 * Switching is VITE_API_MODE. No page changes, because no page knows which one
 * it is talking to. That is the point: swapping in the real backend is a
 * transport change, not a rewrite.
 */

const MODE = import.meta.env.VITE_API_MODE === 'live' ? 'live' : 'fixtures';

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly surfaces?: Record<string, string[]>,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const ok = <T>(data: T, meta: ApiResponse<T>['meta'] = {}): ApiResponse<T> => ({
  data,
  error: null,
  meta,
});

/** Keeps the fixtures path asynchronous, so loading states are exercised in dev. */
const settle = <T>(value: T, ms = MODE === 'fixtures' ? 120 : 0): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

async function live<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'same-origin',
  });

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'network_error',
      'We could not reach the server. Check your connection and try again.',
      undefined,
      res.status,
    );
  }

  if (body.error) {
    throw new ApiError(body.error.code, body.error.message, body.error.surfaces, res.status);
  }
  return body;
}

/* -------------------------------------------------------------------------
 * Reads
 * ---------------------------------------------------------------------- */

export async function getServices(): Promise<ApiResponse<Service[]>> {
  if (MODE === 'live') return live<Service[]>('/services');
  return settle(ok(activeServices()));
}

export async function getService(slug: string): Promise<ApiResponse<Service>> {
  if (MODE === 'live') return live<Service>(`/services/${encodeURIComponent(slug)}`);
  const found = serviceBySlug(slug);
  if (!found) throw new ApiError('service_not_found', 'That service does not exist.');
  return settle(ok(found));
}

export async function checkCoverage(pincode: string): Promise<ApiResponse<CoverageResult>> {
  if (MODE === 'live') {
    return live<CoverageResult>(`/service-areas/check?pincode=${encodeURIComponent(pincode)}`);
  }

  const area = findArea(pincode);
  if (!area) {
    return settle(
      ok<CoverageResult>({
        pincode,
        covered: false,
        services: [],
        nearbyCovered: nearestCovered(pincode).map((a) => ({
          pincode: a.pincode,
          locality: a.locality,
          city: a.city,
        })),
      }),
    );
  }

  // An empty serviceSlugs list means every active service is available here.
  const available =
    area.serviceSlugs.length === 0
      ? activeServices()
      : activeServices().filter((s) => area.serviceSlugs.includes(s.slug));

  return settle(
    ok<CoverageResult>({
      pincode,
      covered: true,
      city: area.city,
      citySlug: area.citySlug,
      locality: area.locality,
      services: available,
    }),
  );
}

export async function getServiceAreas(): Promise<ApiResponse<ServiceArea[]>> {
  if (MODE === 'live') return live<ServiceArea[]>('/service-areas');
  return settle(ok(activeAreas()));
}

export async function getAllServiceAreas(): Promise<ApiResponse<ServiceArea[]>> {
  if (MODE === 'live') return live<ServiceArea[]>('/service-areas?includeInactive=true');
  const { serviceAreas } = await import('@/content/serviceAreas.js');
  return settle(ok(serviceAreas));
}

export async function getProfessionals(): Promise<ApiResponse<Professional[]>> {
  if (MODE === 'live') return live<Professional[]>('/professionals');
  return settle(ok(professionals));
}

export async function getReviews(): Promise<ApiResponse<Review[]>> {
  if (MODE === 'live') return live<Review[]>('/reviews');
  return settle(ok(reviews));
}

export async function getTeam(): Promise<ApiResponse<TeamMember[]>> {
  if (MODE === 'live') return live<TeamMember[]>('/team');
  return settle(ok(team));
}

export async function getArticles(): Promise<ApiResponse<Article[]>> {
  if (MODE === 'live') return live<Article[]>('/articles');
  return settle(ok(publishedArticles()));
}

export async function getArticle(slug: string): Promise<ApiResponse<Article>> {
  if (MODE === 'live') return live<Article>(`/articles/${encodeURIComponent(slug)}`);
  const found = articleBySlug(slug);
  if (!found) throw new ApiError('article_not_found', 'That article does not exist.');
  return settle(ok(found));
}

export async function getJobs(): Promise<ApiResponse<JobOpening[]>> {
  if (MODE === 'live') return live<JobOpening[]>('/jobs');
  return settle(ok(openJobs()));
}

/* -------------------------------------------------------------------------
 * Writes
 *
 * In fixtures mode these validate and echo, so the whole flow including the
 * confirmation screen can be walked end to end without a backend. They never
 * pretend to have persisted anything: `persisted` says which it was.
 * ---------------------------------------------------------------------- */

export interface SubmissionResult {
  reference: string;
  persisted: boolean;
}

/** BR-2K4M7P: no vowels, so no accidental words, and no 0/O or 1/I confusion. */
function makeReference(prefix: string): string {
  const alphabet = '23456789BCDFGHJKLMNPQRSTVWXYZ';
  let out = '';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `${prefix}-${out}`;
}

export async function submitBooking(payload: unknown): Promise<ApiResponse<SubmissionResult>> {
  if (MODE === 'live') {
    return live<SubmissionResult>('/bookings', { method: 'POST', body: JSON.stringify(payload) });
  }
  return settle(ok({ reference: makeReference('BR'), persisted: false }), 700);
}

export async function submitProfessionalApplication(
  payload: unknown,
): Promise<ApiResponse<SubmissionResult>> {
  if (MODE === 'live') {
    return live<SubmissionResult>('/applications/professional', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  return settle(ok({ reference: makeReference('AP'), persisted: false }), 700);
}

export async function submitCareerApplication(
  payload: unknown,
): Promise<ApiResponse<SubmissionResult>> {
  if (MODE === 'live') {
    return live<SubmissionResult>('/applications/career', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  return settle(ok({ reference: makeReference('CA'), persisted: false }), 700);
}

export async function submitLead(payload: unknown): Promise<ApiResponse<SubmissionResult>> {
  if (MODE === 'live') {
    return live<SubmissionResult>('/leads', { method: 'POST', body: JSON.stringify(payload) });
  }
  return settle(ok({ reference: makeReference('LD'), persisted: false }), 500);
}

export const apiMode = MODE;
