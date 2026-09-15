import type { ServiceCategory } from '@shared/types/index.js';

/**
 * Category icons.
 *
 * Line drawings, ink, no fills and no colour of their own. They are
 * orientation marks on a card, not decoration, and none of them is a
 * stethoscope or a red cross - spec 5.1 rejects the clinical convention
 * outright.
 */
const PATHS: Record<ServiceCategory, string> = {
  // A hand holding a heart: care given, not a medical instrument.
  nursing:
    'M12 20.5c-3.2-2.4-6.5-5-6.5-8.3A3.2 3.2 0 0 1 12 10.4a3.2 3.2 0 0 1 6.5 1.8c0 3.3-3.3 5.9-6.5 8.3Z M3.5 20.5v-6 M3.5 14.5a2 2 0 0 1 2-2',
  // A house with a person inside.
  caregiving: 'M4 20V10l8-6 8 6v10 M12 20v-4.5 M9.5 20v-2.5a2.5 2.5 0 0 1 5 0V20',
  // A figure mid-stride with a support rail.
  physiotherapy:
    'M13 4.5a1.2 1.2 0 1 0 0-.1 M12.5 8l-2.5 3 2 2.5V20 M10 13.5 7 20 M14.5 11l3 1.5 M20 8v12',
  // A doctor bag.
  'doctor-visit': 'M4 9h16v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9Z M9 9V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V9 M12 12.5v4 M10 14.5h4',
  // A sample vial.
  diagnostics: 'M9 3h6 M10 3v11a2 2 0 0 0 4 0V3 M10 11h4 M12 17.5v3',
  // A wheelchair.
  equipment:
    'M14 4.2a1.2 1.2 0 1 0 0-.1 M13.5 8v4.5H18 M13.5 12.5 16 20 M12.5 10.5a5 5 0 1 0 4.2 7',
};

export function ServiceIcon({
  category,
  className,
}: {
  category: ServiceCategory;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[category].split(' M').map((d, i) => (
        <path key={i} d={i === 0 ? d : `M${d}`} />
      ))}
    </svg>
  );
}
