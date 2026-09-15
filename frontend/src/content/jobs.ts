import type { JobOpening } from '@shared/types/index.js';

/**
 * Open roles.
 *
 * Spec 6.6: never a dead link. When this list is empty /careers renders an
 * honest empty state with a general-interest form rather than a broken page,
 * so shipping with no openings is a supported state, not a bug.
 */
export const jobs: JobOpening[] = [
  {
    id: 'job-1',
    slug: 'care-coordinator-ahmedabad',
    title: 'Care coordinator',
    department: 'Operations',
    location: 'Ahmedabad',
    employmentType: 'full-time',
    postedAt: '2026-09-01',
    isOpen: true,
    description:
      'You are the person a family speaks to when they call at eleven at night after a discharge nobody planned for. You take the request, work out what is actually needed, match a professional, and stay with the booking until the care is running. When a nurse calls in sick at six in the morning, you are the one who fixes it.',
    requirements: [
      'Two years in operations, healthcare coordination or a similar role where people depend on you',
      'Fluent Gujarati, Hindi and English, because families switch between all three',
      'Comfortable making twenty phone calls before lunch',
      'Calm with someone who is frightened and not at their best',
      'Willing to take a share of the on-call rota',
    ],
  },
  {
    id: 'job-2',
    slug: 'credential-verification-officer',
    title: 'Credential verification officer',
    department: 'Quality and compliance',
    location: 'Ahmedabad',
    employmentType: 'full-time',
    postedAt: '2026-08-22',
    isOpen: true,
    description:
      'You decide who reaches a patient. Every nurse, caregiver, physiotherapist and doctor in the network goes through you first: council registration, identity, qualifications, police verification, and two previous employers actually telephoned. You also hold the expiry calendar, because a lapsed nursing registration in the surface is a serious liability.',
    requirements: [
      'Experience in background verification, HR compliance or healthcare credentialling',
      'Methodical to the point of stubborn, and comfortable saying no',
      'Familiar with state nursing and medical council registers, or able to learn them quickly',
      'Careful with documents that contain other people’s personal data',
    ],
  },
  {
    id: 'job-3',
    slug: 'senior-home-care-nurse-vadodara',
    title: 'Senior home care nurse',
    department: 'Clinical',
    location: 'Vadodara',
    employmentType: 'full-time',
    postedAt: '2026-08-15',
    isOpen: true,
    description:
      'Clinical care in patients’ homes on a regular shift, and support for less experienced nurses on complex cases. Mostly post-operative care, long-term catheter and tracheostomy management, and the cases where a coordinator wants a second opinion on whether something is healing properly.',
    requirements: [
      'GNM or BSc Nursing with a current Gujarat Nursing Council registration',
      'At least five years, with some post-operative or critical care experience',
      'Confident working alone in someone’s home without a ward around you',
      'Gujarati and Hindi. English is useful but not required.',
    ],
  },
  {
    id: 'job-4',
    slug: 'physiotherapist-visit-based-ahmedabad',
    title: 'Physiotherapist',
    department: 'Clinical',
    location: 'Ahmedabad',
    employmentType: 'visit-based',
    postedAt: '2026-09-08',
    isOpen: true,
    description:
      'Visit-based work, paid per session, with the number of sessions a week you choose. Mostly post-operative mobility, falls rehabilitation and stroke recovery, working in patients’ own homes rather than a clinic.',
    requirements: [
      'BPT or MPT with current registration',
      'Your own transport, since the work is across localities',
      'Willing to assess the home as well as the patient',
    ],
  },
];

export const openJobs = (): JobOpening[] =>
  jobs.filter((j) => j.isOpen).sort((a, b) => b.postedAt.localeCompare(a.postedAt));

export const jobBySlug = (slug: string): JobOpening | undefined =>
  jobs.find((j) => j.slug === slug && j.isOpen);
