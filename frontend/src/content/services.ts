import type { Service } from '@shared/types/index.js';

/**
 * The service catalogue.
 *
 * This is the seed content for the CMS. In fixtures mode the API client reads
 * it directly; in live mode the same records are served from the database and
 * edited by a Content Editor in the admin portal. The shape is identical
 * either way, so no page knows the difference.
 *
 * Prices are indicative starting figures in rupees, which is the point of
 * spec 6.2: almost nobody in this category publishes them.
 */
export const services: Service[] = [
  {
    id: 'svc-home-nursing',
    slug: 'home-nursing',
    category: 'nursing',
    name: 'Home nursing',
    summary: 'A qualified nurse at home for wound care, injections, catheters and monitoring.',
    description:
      'A GNM or BSc nurse comes to your home on a fixed shift and handles the clinical work a hospital ward would: dressings, injections, IV lines, catheter and tube care, vitals, and medication on schedule. The nurse reports to a coordinator daily, and anything that needs a doctor is escalated the same day.',
    inclusions: [
      'Wound dressing and suture care',
      'Injections, IV lines and infusions',
      'Catheter, Ryles tube and tracheostomy care',
      'Vitals monitoring and a written daily log',
      'Medication given on schedule',
      'Handover notes at the end of every shift',
    ],
    exclusions: [
      'Cooking, cleaning and household chores',
      'Diagnosis or changing a prescription, which only a doctor does',
      'Medicines, consumables and dressing material, billed separately at cost',
      'Emergency response, which needs a hospital and an ambulance',
    ],
    suitableFor: [
      'Someone discharged after surgery who still needs clinical care',
      'A patient with a wound, stoma or catheter that needs regular attention',
      'Long-term conditions where a hospital stay is not the right place',
    ],
    qualificationRequired: 'GNM or BSc Nursing, registered with the state nursing council',
    durationOptions: ['single-visit', 'twelve-hour', 'twenty-four-hour', 'monthly'],
    basePrice: 1400,
    priceUnit: 'per-12-hour-shift',
    priceFactors: [
      'Whether the shift is 12 or 24 hours',
      'How clinically complex the care is, for example a ventilator or tracheostomy',
      'Night shifts and Sunday cover',
      'How far the address is from the nearest covered locality',
    ],
    faqs: [
      {
        question: 'Will the same nurse come every day?',
        answer:
          'For a monthly booking, yes. We assign a primary nurse and a named backup who covers their leave, and you meet both before the booking starts. For single visits it depends on who is free, and you get the profile before they arrive either way.',
      },
      {
        question: 'What happens if the nurse cannot come one morning?',
        answer:
          'Call the coordinator on the number in your confirmation. A replacement is arranged from the backup assigned to your booking. If we cannot fill the shift you are not charged for it.',
      },
      {
        question: 'Do you supply the dressing material and medicines?',
        answer:
          'No. We buy them for you if you ask and bill at the pharmacy price with the receipt attached. Most families find it cheaper to keep a stock at home.',
      },
    ],
    isActive: true,
    displayOrder: 1,
  },

  {
    id: 'svc-post-surgery-care',
    slug: 'post-surgery-care',
    category: 'nursing',
    name: 'Post-surgery care',
    summary: 'Nursing for the first weeks after an operation, starting the day of discharge.',
    description:
      'Care built around a specific operation and the surgeon’s discharge instructions. The nurse manages the surgical wound, watches for infection and clot signs, keeps pain relief on schedule, and gets the patient moving on the timetable the surgeon set. We can start on the day of discharge if the hospital gives us the summary in advance.',
    inclusions: [
      'Surgical wound and drain care',
      'Watching for infection, clots and other complications',
      'Pain relief given on schedule',
      'Getting the patient moving and sitting up on the surgeon’s timetable',
      'Coordinating the follow-up appointment',
      'A written report the surgeon can read at review',
    ],
    exclusions: [
      'Removing sutures or staples, unless the surgeon has written the instruction',
      'Changing the surgeon’s plan in any way',
      'Transport to the follow-up appointment',
    ],
    suitableFor: [
      'Someone going home after orthopaedic, cardiac or abdominal surgery',
      'A patient living alone with nobody at home during the day',
      'Families who want the first fortnight handled by someone who has done it before',
    ],
    qualificationRequired: 'GNM or BSc Nursing with at least three years of post-operative experience',
    durationOptions: ['single-visit', 'hourly', 'twelve-hour', 'twenty-four-hour'],
    basePrice: 900,
    priceUnit: 'per-visit',
    priceFactors: [
      'How many visits a day the surgeon has asked for',
      'The type of surgery and how complex the wound care is',
      'Whether the booking is a set of visits or a full shift',
    ],
    faqs: [
      {
        question: 'Can you start on the day my father is discharged?',
        answer:
          'Usually yes, if you tell us the day before and send the discharge summary. Same-day starts are possible before 2pm; after that it depends on who is free.',
      },
      {
        question: 'Do you talk to the surgeon?',
        answer:
          'We work from the written discharge instructions. If something looks wrong the coordinator calls the hospital, and we tell you before we do it.',
      },
    ],
    isActive: true,
    displayOrder: 2,
  },

  {
    id: 'svc-elderly-caregiver',
    slug: 'elderly-caregiver',
    category: 'caregiving',
    name: 'Elderly caregiver',
    summary: 'A trained attendant for bathing, meals, mobility and company through the day.',
    description:
      'An attendant for the parts of the day that have become difficult: getting out of bed, bathing, dressing, eating, walking to the bathroom, and remembering tablets. Not clinical work, and the caregiver is trained to notice when something has changed and to say so rather than wait.',
    inclusions: [
      'Bathing, dressing and personal hygiene',
      'Help moving around and going to the bathroom',
      'Feeding, and reminders to drink water',
      'Medication reminders against a written chart',
      'Light exercise the physiotherapist has set',
      'Company, conversation and a daily note on how the day went',
    ],
    exclusions: [
      'Injections, dressings or any clinical task, which need a nurse',
      'Cooking for the household, though the caregiver prepares the patient’s meal',
      'General house cleaning',
      'Being left in charge overnight on a 12-hour booking',
    ],
    suitableFor: [
      'A parent living alone who is managing less well than last year',
      'Families where everyone works during the day',
      'Someone recovering from a fall who is not steady yet',
    ],
    qualificationRequired: 'Certified attendant training and a police-verified background check',
    durationOptions: ['hourly', 'twelve-hour', 'twenty-four-hour', 'monthly'],
    basePrice: 900,
    priceUnit: 'per-12-hour-shift',
    priceFactors: [
      'Shift length, and whether nights are included',
      'Whether the patient is bed-bound and needs two-person lifting',
      'Language preference, which narrows who is available',
      'Monthly bookings cost less per day than single shifts',
    ],
    faqs: [
      {
        question: 'Is the caregiver police verified?',
        answer:
          'Every caregiver we place has a police verification on file and we will show it to you. Where one is still pending, we say so before assigning and you can decline.',
      },
      {
        question: 'Can we ask for a woman caregiver?',
        answer:
          'Yes. You set the preference when you book and we only propose people who match it.',
      },
      {
        question: 'What if my mother does not get on with the caregiver?',
        answer:
          'Tell the coordinator and we change the assignment. It is not a complaint and it happens often enough that we plan for it.',
      },
    ],
    isActive: true,
    displayOrder: 3,
  },

  {
    id: 'svc-mother-newborn-care',
    slug: 'mother-and-newborn-care',
    category: 'caregiving',
    name: 'Mother and newborn care',
    summary: 'A trained attendant for the first weeks after birth, for the mother and the baby.',
    description:
      'Support through the weeks after a birth: recovery care for the mother including caesarean wound checks, help with feeding and latching, bathing and handling the baby, and keeping a record of feeds and weight. The attendant is trained in newborn care specifically, not general caregiving.',
    inclusions: [
      'Recovery care for the mother, including caesarean wound checks',
      'Help with feeding, latching and expressing',
      'Bathing, massage and handling the baby',
      'A feed, sleep and weight record',
      'Advice on the vaccination schedule and when the next one is due',
      'Overnight cover so the mother can sleep',
    ],
    exclusions: [
      'Medical treatment for the mother or the baby',
      'Vaccinations, which a doctor or clinic gives',
      'Cooking for the household',
    ],
    suitableFor: [
      'A first-time mother with no family support at home',
      'Recovery after a caesarean',
      'Families who want someone experienced through the first month',
    ],
    qualificationRequired: 'Certified newborn care training and a police-verified background check',
    durationOptions: ['twelve-hour', 'twenty-four-hour', 'monthly'],
    basePrice: 1200,
    priceUnit: 'per-12-hour-shift',
    priceFactors: [
      'Day shift, night shift or live-in',
      'Twins, which need a second pair of hands',
      'Whether the booking is for weeks or a single month',
    ],
    faqs: [
      {
        question: 'How soon before the due date should we book?',
        answer:
          'Three to four weeks ahead gets you a choice of people. We take last-minute bookings but the choice is narrower.',
      },
      {
        question: 'Can she stay overnight?',
        answer:
          'Yes, on a 24-hour or live-in booking. She needs a place to sleep and a four-hour rest block, which you agree with the coordinator when the booking starts.',
      },
    ],
    isActive: true,
    displayOrder: 4,
  },

  {
    id: 'svc-physiotherapy',
    slug: 'physiotherapy-at-home',
    category: 'physiotherapy',
    name: 'Physiotherapy at home',
    summary: 'A physiotherapist who brings the equipment and works in your own rooms.',
    description:
      'A qualified physiotherapist assesses the patient at home and works a programme in the rooms they actually have to move around in. That matters more than it sounds: stairs, bathroom thresholds and bed height are the things that decide whether someone recovers their independence, and a clinic cannot see any of them.',
    inclusions: [
      'An assessment at home and a written programme',
      'Sessions with the equipment brought to you',
      'Gait, balance and fall-prevention work',
      'Exercises taught to a family member so they continue between visits',
      'Progress measured and reported every fortnight',
    ],
    exclusions: [
      'Equipment you keep, which is rented separately',
      'Treatment without a referral where the condition needs a doctor first',
      'Hydrotherapy and gym-based rehabilitation',
    ],
    suitableFor: [
      'Recovery after a knee or hip replacement',
      'Stroke rehabilitation at home',
      'An older person who has had a fall, or is afraid of having one',
      'Long-term back and joint pain',
    ],
    qualificationRequired: 'BPT or MPT, registered with the state physiotherapy association',
    durationOptions: ['single-visit', 'hourly', 'monthly'],
    basePrice: 700,
    priceUnit: 'per-visit',
    priceFactors: [
      'How many sessions a week the programme needs',
      'Specialised work such as neuro or cardiac rehabilitation',
      'Packages of twelve sessions or more cost less per session',
    ],
    faqs: [
      {
        question: 'Do we need a doctor’s referral?',
        answer:
          'Not for general mobility, pain or post-operative work. For neurological and cardiac rehabilitation we ask for the referral so the programme matches the medical plan.',
      },
      {
        question: 'What equipment do they bring?',
        answer:
          'Resistance bands, a goniometer, a portable TENS unit and whatever the programme calls for. Anything you need daily, such as a walker, is better rented than carried in and out.',
      },
    ],
    isActive: true,
    displayOrder: 5,
  },

  {
    id: 'svc-doctor-visit',
    slug: 'doctor-visit-at-home',
    category: 'doctor-visit',
    name: 'Doctor visit at home',
    summary: 'A physician who comes to the house for an examination, not a video call.',
    description:
      'An MBBS or MD physician visits, examines the patient properly, and writes a prescription. For a patient who cannot easily be moved, this replaces the ordeal of getting to a clinic and waiting there. The visit note goes to you and to the nurse or caregiver on the booking, so everyone is working from the same instructions.',
    inclusions: [
      'A full examination at home',
      'A written prescription and visit note',
      'Review of current medicines and interactions',
      'A referral where a hospital or specialist is needed',
      'Instructions handed to the nurse or caregiver on the booking',
    ],
    exclusions: [
      'Emergencies, which need an ambulance and a hospital',
      'Procedures needing hospital equipment',
      'Medicines and tests, which are billed separately',
      'Specialist opinions, unless booked as such',
    ],
    suitableFor: [
      'A bed-bound patient who cannot easily reach a clinic',
      'A review of medication for someone on several prescriptions',
      'A second look when a patient is not recovering as expected',
    ],
    qualificationRequired: 'MBBS or MD, registered with the state medical council',
    durationOptions: ['single-visit'],
    basePrice: 1200,
    priceUnit: 'per-visit',
    priceFactors: [
      'General physician or specialist',
      'Evening, night and Sunday visits',
      'Distance from the nearest covered locality',
    ],
    faqs: [
      {
        question: 'How quickly can a doctor come?',
        answer:
          'Same day for a morning request in a covered locality. We tell you the window when you book and the coordinator confirms the time once a doctor accepts.',
      },
      {
        question: 'Is this an emergency service?',
        answer:
          'No. If someone is having chest pain, breathing difficulty, a suspected stroke or heavy bleeding, call an ambulance. We will not be faster and this is not what the service is for.',
      },
    ],
    isActive: true,
    displayOrder: 6,
  },

  {
    id: 'svc-lab-tests',
    slug: 'lab-tests-at-home',
    category: 'diagnostics',
    name: 'Lab tests at home',
    summary: 'Sample collection at home, with reports emailed and explained.',
    description:
      'A trained phlebotomist collects samples at home and the tests run at an accredited partner laboratory. Reports come by email and WhatsApp, and if a result is abnormal a coordinator calls you rather than leaving you to interpret it yourself.',
    inclusions: [
      'Sample collection at home at a slot you choose',
      'Tests run at an NABL-accredited partner laboratory',
      'Reports by email and WhatsApp',
      'A call from a coordinator if a result is abnormal',
      'Collection is free when tests total more than 500 rupees',
    ],
    exclusions: [
      'Imaging such as X-ray, ultrasound and CT',
      'Tests needing hospital equipment or a fasting protocol we cannot supervise',
      'Interpretation, which is a doctor’s job and not the coordinator’s',
    ],
    suitableFor: [
      'Routine monitoring for a patient already on a booking',
      'Someone for whom getting to a collection centre is hard',
      'Pre-operative tests before an admission',
    ],
    qualificationRequired: 'Certified phlebotomist from an NABL-accredited partner laboratory',
    durationOptions: ['single-visit'],
    basePrice: 300,
    priceUnit: 'per-visit',
    priceFactors: [
      'Which tests are on the panel',
      'Whether collection is free, which depends on the order total',
      'Urgent same-day reporting',
    ],
    faqs: [
      {
        question: 'How long do reports take?',
        answer:
          'Most routine panels report the same evening if the sample is collected before 11am. Cultures and specialised tests take two to four days and we tell you which when you book.',
      },
    ],
    isActive: true,
    displayOrder: 7,
  },

  {
    id: 'svc-equipment-rental',
    slug: 'medical-equipment-rental',
    category: 'equipment',
    name: 'Medical equipment on rent',
    summary: 'Hospital beds, oxygen concentrators and wheelchairs, delivered and installed.',
    description:
      'Equipment delivered, installed and demonstrated to whoever will be using it, on a monthly rental with servicing included. Buying a hospital bed for a six-week recovery makes little sense, and a bed nobody knows how to raise is worse than no bed.',
    inclusions: [
      'Delivery, installation and a demonstration to the family',
      'Servicing and replacement if a unit fails',
      'Monthly rental with no minimum beyond the first month',
      'Collection at the end at no extra charge',
    ],
    exclusions: [
      'Consumables such as oxygen masks, tubing and mattress covers',
      'Damage beyond normal wear',
      'Equipment needing a hospital power supply or piped oxygen',
    ],
    suitableFor: [
      'A patient who will be in bed for weeks rather than days',
      'Home oxygen prescribed by a doctor',
      'Recovering mobility after surgery or a fall',
    ],
    qualificationRequired: 'Installed by a trained technician from a licensed equipment partner',
    durationOptions: ['monthly'],
    basePrice: 2500,
    priceUnit: 'per-month',
    priceFactors: [
      'Which equipment, and whether the bed is manual or electric',
      'How many months, since longer rentals cost less per month',
      'A refundable deposit, returned when the unit is collected',
    ],
    faqs: [
      {
        question: 'How quickly can a hospital bed be delivered?',
        answer:
          'Within 24 hours in a covered locality, and often the same day if you order before noon. Installation takes about half an hour.',
      },
      {
        question: 'Do you need a prescription for an oxygen concentrator?',
        answer:
          'Yes. Home oxygen needs a doctor’s prescription stating the flow rate, and we cannot deliver one without it.',
      },
    ],
    isActive: true,
    displayOrder: 8,
  },
];

export const serviceBySlug = (slug: string): Service | undefined =>
  services.find((s) => s.slug === slug && s.isActive);

export const activeServices = (): Service[] =>
  services.filter((s) => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
