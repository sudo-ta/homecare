import type { Professional, Review, TeamMember } from '@shared/types/index.js';
import { demoOnly } from './demoFlag.js';

/**
 * PLACEHOLDER PEOPLE. None of these are real.
 *
 * They exist so the layout, the verification badge and the filters can be
 * reviewed. They are served only when VITE_DEMO_CONTENT=true - see demoFlag.ts
 * for why that gate exists.
 *
 * Before launch, replace every record here with a real professional who has
 * consented to appear, and supply a real photograph. photoUrl is null
 * throughout: the UI renders initials rather than a stock face, because a stock
 * face on this page is a lie about who is coming to the house.
 */
const demoProfessionals: Professional[] = [
  {
    id: 'pro-1',
    fullName: 'Reena Parmar',
    role: 'nurse',
    experienceYears: 9,
    qualification: 'GNM, Gujarat Nursing Council',
    languages: ['Gujarati', 'Hindi', 'English'],
    citySlug: 'ahmedabad',
    areas: ['Navrangpura', 'Ellisbridge', 'Paldi', 'Ambawadi'],
    photoUrl: null,
    bio: 'Nine years on surgical wards before moving to home care. Most of her work is the first fortnight after an operation, and she is the person coordinators send when a wound is not healing the way it should.',
    verifiedChecks: [
      'Nursing council registration checked',
      'Government ID verified',
      'Police verification on file',
      'Two previous employers contacted',
    ],
    status: 'active',
    serviceSlugs: ['home-nursing', 'post-surgery-care'],
  },
  {
    id: 'pro-2',
    fullName: 'Mahesh Chauhan',
    role: 'caregiver',
    experienceYears: 6,
    qualification: 'Certified attendant, Indian Nursing Council recognised programme',
    languages: ['Gujarati', 'Hindi'],
    citySlug: 'ahmedabad',
    areas: ['Maninagar', 'Vatva road', 'Naroda'],
    photoUrl: null,
    bio: 'Works with bed-bound patients and is trained in two-person transfers. Families ask for him again because he notices a change in a patient before anyone else does and says so straight away.',
    verifiedChecks: [
      'Attendant certification checked',
      'Government ID verified',
      'Police verification on file',
    ],
    status: 'active',
    serviceSlugs: ['elderly-caregiver'],
  },
  {
    id: 'pro-3',
    fullName: 'Dr Anjali Mehta',
    role: 'physiotherapist',
    experienceYears: 11,
    qualification: 'MPT Neurology, Gujarat State Physiotherapy Association',
    languages: ['Gujarati', 'Hindi', 'English', 'Marathi'],
    citySlug: 'ahmedabad',
    areas: ['Satellite', 'Vastrapur', 'Bopal', 'Thaltej'],
    photoUrl: null,
    bio: 'Stroke and post-operative rehabilitation. She assesses the house before the patient, because a threshold at the bathroom door decides more about recovery than anything that happens in a clinic.',
    verifiedChecks: [
      'Physiotherapy registration checked',
      'Government ID verified',
      'Police verification on file',
      'Degree verified with the university',
    ],
    status: 'active',
    serviceSlugs: ['physiotherapy-at-home'],
  },
  {
    id: 'pro-4',
    fullName: 'Sunita Rathod',
    role: 'caregiver',
    experienceYears: 7,
    qualification: 'Certified newborn and maternal care',
    languages: ['Gujarati', 'Hindi'],
    citySlug: 'vadodara',
    areas: ['Alkapuri', 'Fatehgunj', 'Gotri'],
    photoUrl: null,
    bio: 'Works with mothers through the first six weeks, including after a caesarean. Trained in latching support and keeps the feed and weight record that the paediatrician reads at the first review.',
    verifiedChecks: [
      'Newborn care certification checked',
      'Government ID verified',
      'Police verification on file',
    ],
    status: 'active',
    serviceSlugs: ['mother-and-newborn-care', 'elderly-caregiver'],
  },
  {
    id: 'pro-5',
    fullName: 'Dr Vikram Desai',
    role: 'doctor',
    experienceYears: 14,
    qualification: 'MBBS, MD General Medicine, Gujarat Medical Council',
    languages: ['Gujarati', 'Hindi', 'English'],
    citySlug: 'ahmedabad',
    areas: ['Navrangpura', 'Naranpura', 'Sola', 'Ghatlodia'],
    photoUrl: null,
    bio: 'General physician doing home visits for patients who cannot easily be moved. Much of his work is reviewing the medicine list of someone on seven prescriptions and removing the ones that are fighting each other.',
    verifiedChecks: [
      'Medical council registration checked',
      'Government ID verified',
      'Qualifications verified with the university',
    ],
    status: 'active',
    serviceSlugs: ['doctor-visit-at-home'],
  },
  {
    id: 'pro-6',
    fullName: 'Kiran Solanki',
    role: 'nurse',
    experienceYears: 5,
    qualification: 'BSc Nursing, Gujarat Nursing Council',
    languages: ['Gujarati', 'Hindi', 'English'],
    citySlug: 'vadodara',
    areas: ['Raopura', 'Manjalpur', 'Akota'],
    photoUrl: null,
    bio: 'Critical care background, now doing home nursing for patients on tracheostomy and long-term catheter care. Comfortable with the equipment families find most frightening at first.',
    verifiedChecks: [
      'Nursing council registration checked',
      'Government ID verified',
      'Police verification on file',
    ],
    status: 'active',
    serviceSlugs: ['home-nursing', 'post-surgery-care'],
  },
];

/**
 * PLACEHOLDER REVIEWS. None of these are real.
 *
 * Each names the service and the city, which is the bar spec 6.2 sets, so the
 * layout can be judged. They must be replaced with real, consented,
 * attributable feedback before launch, or the section stays empty - which is
 * the correct outcome, not a failure.
 */
const demoReviews: Review[] = [
  {
    id: 'rev-1',
    author: 'Hetal S.',
    city: 'Ahmedabad',
    serviceSlug: 'post-surgery-care',
    serviceName: 'Post-surgery care',
    rating: 5,
    body: 'My father came home after a hip replacement and none of us knew how to move him without hurting him. The nurse showed us on the first evening and stayed twelve days. She caught an infection in the wound on day four, before any of us had noticed anything.',
    publishedAt: '2026-07-18',
  },
  {
    id: 'rev-2',
    author: 'Nirav P.',
    city: 'Vadodara',
    serviceSlug: 'elderly-caregiver',
    serviceName: 'Elderly caregiver',
    rating: 4,
    body: 'We have had an attendant for my mother for four months. The first person was not the right fit and they changed her within a week without making it awkward. The second has been with us since. Billing is clear and nobody has ever asked us for cash.',
    publishedAt: '2026-08-02',
  },
  {
    id: 'rev-3',
    author: 'Farida K.',
    city: 'Ahmedabad',
    serviceSlug: 'physiotherapy-at-home',
    serviceName: 'Physiotherapy at home',
    rating: 5,
    body: 'After my stroke I could not get to the clinic three times a week. The physiotherapist came here instead and rearranged our front room so I could practise walking to the kitchen. Eleven weeks and I manage the stairs on my own now.',
    publishedAt: '2026-06-29',
  },
  {
    id: 'rev-4',
    author: 'Sameer D.',
    city: 'Ahmedabad',
    serviceSlug: 'home-nursing',
    serviceName: 'Home nursing',
    rating: 4,
    body: 'Booked at eleven at night after a discharge we were not ready for. A nurse was here by seven the next morning. One shift was missed in six weeks and they called us before we noticed and did not charge for it.',
    publishedAt: '2026-08-21',
  },
];

/**
 * PLACEHOLDER TEAM. Not real people.
 *
 * Spec 6.6 asks /about for named people with photographs and stated clinical
 * governance. That page is only worth anything if the names are real, so these
 * are gated with everything else.
 */
const demoTeam: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Dr Priya Nair',
    role: 'Clinical director',
    photoUrl: null,
    bio: 'Sets the clinical protocols, signs off which cases the service can safely take at home, and reviews every incident. Eighteen years in hospital medicine before this.',
    credentials: ['MBBS, MD Internal Medicine', 'Gujarat Medical Council registered'],
  },
  {
    id: 'team-2',
    name: 'Alpesh Thakkar',
    role: 'Head of operations',
    photoUrl: null,
    bio: 'Runs the coordinator team and the assignment desk. Responsible for the promise that somebody answers the phone at six in the morning when a nurse calls in sick.',
    credentials: ['MBA Operations', 'Eleven years in healthcare logistics'],
  },
  {
    id: 'team-3',
    name: 'Meera Joshi',
    role: 'Head of verification',
    photoUrl: null,
    bio: 'Checks every professional before they are placed: council registration, identity, police verification, and two previous employers. Nobody reaches a patient without her sign-off.',
    credentials: ['GNM', 'Nine years in nursing recruitment'],
  },
];

export const professionals: Professional[] = demoOnly(demoProfessionals);
export const reviews: Review[] = demoOnly(demoReviews);
export const team: TeamMember[] = demoOnly(demoTeam);

export const verifiedProfessionals = (): Professional[] =>
  professionals.filter((p) => p.status === 'active' || p.status === 'verified');
