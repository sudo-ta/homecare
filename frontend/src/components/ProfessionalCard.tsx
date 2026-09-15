import type { Professional } from '@shared/types/index.js';
import { Card, CardBody, VerifiedBadge } from '@shared/ui/index.js';
import { roleLabel, years } from '@/lib/format.js';
import { Avatar } from './Avatar.js';

/**
 * A professional's public profile card.
 *
 * Spec 6.2 calls this the single biggest trust lever on the home page. What
 * makes it work is specificity: a name, a real qualification, the languages
 * they speak, and a verification badge that says what was actually checked
 * rather than showing a decorative tick.
 *
 * No contact details are ever rendered here (spec 6.6).
 */
export function ProfessionalCard({
  professional,
  showChecks = false,
}: {
  professional: Professional;
  showChecks?: boolean;
}) {
  const p = professional;
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-1.5">
        <div className="flex items-start gap-1.5">
          <Avatar name={p.fullName} photoUrl={p.photoUrl} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="text-h3 text-ink">{p.fullName}</h3>
            <p className="text-small text-ink-soft">
              {roleLabel(p.role)} &middot; {years(p.experienceYears)}
            </p>
            <VerifiedBadge className="mt-0.5 self-start" />
          </div>
        </div>

        <p className="flex-1 text-body text-ink-soft">{p.bio}</p>

        {/* A two-column grid rather than flex rows: the values then align down
            the card, and a long qualification wraps against its own left edge
            instead of centring under the label. */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-1.5 gap-y-0.5 text-meta">
          <dt className="text-ink-soft">Qualification</dt>
          <dd className="text-ink">{p.qualification}</dd>

          <dt className="text-ink-soft">Speaks</dt>
          <dd className="text-ink">{p.languages.join(', ')}</dd>

          <dt className="text-ink-soft">Works in</dt>
          <dd className="text-ink">{p.areas.join(', ')}</dd>
        </dl>

        {showChecks ? (
          <div className="border-t border-line pt-1.5">
            <p className="text-small font-medium text-ink">What we checked</p>
            <ul className="mt-0.5 flex flex-col gap-0.25">
              {p.verifiedChecks.map((c) => (
                <li key={c} className="flex items-start gap-0.5 text-small text-ink-soft">
                  <svg
                    viewBox="0 0 16 16"
                    className="mt-0.5 size-2 shrink-0 text-positive"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m3 8.5 3.5 3.5L13 5" />
                  </svg>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
