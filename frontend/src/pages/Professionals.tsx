import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import type { ProfessionalRole } from '@shared/types/index.js';
import { EmptyState, Select, Skeleton, SkeletonGroup, buttonClasses } from '@shared/ui/index.js';
import { ProfessionalCard } from '@/components/ProfessionalCard.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { getProfessionals } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

const ROLES: { value: string; label: string }[] = [
  { value: 'all', label: 'Every role' },
  { value: 'nurse', label: 'Nurses' },
  { value: 'caregiver', label: 'Caregivers' },
  { value: 'physiotherapist', label: 'Physiotherapists' },
  { value: 'doctor', label: 'Doctors' },
];

export default function Professionals() {
  const { data, loading } = useApi(getProfessionals, []);
  const [role, setRole] = useState('all');
  const [city, setCity] = useState('all');
  const [language, setLanguage] = useState('all');

  const languages = useMemo(
    () => [...new Set((data ?? []).flatMap((p) => p.languages))].sort(),
    [data],
  );

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (p) =>
          (role === 'all' || p.role === (role as ProfessionalRole)) &&
          (city === 'all' || p.citySlug === city) &&
          (language === 'all' || p.languages.includes(language)),
      ),
    [data, role, city, language],
  );

  return (
    <>
      <Seo
        title={`Our care team - ${brand.name}`}
        description="The nurses, caregivers, physiotherapists and doctors in our network, with their qualifications, languages and what we verified before placing them."
        path="/professionals"
        structuredData={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Our care team', path: '/professionals' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">The people who would come</span>}
          intro="Everyone here has been checked before being placed with a patient. Each profile says exactly which checks were done."
        />
      </Section>

      <Section spacing="tight" className="!pt-0">
        <div className="grid gap-1.5 border-y border-line py-2 sm:grid-cols-3">
          <Select
            label="Role"
            options={ROLES}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <Select
            label="City"
            options={[
              { value: 'all', label: 'Every city' },
              ...brand.cities.filter((c) => c.isLaunched).map((c) => ({ value: c.slug, label: c.name })),
            ]}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select
            label="Speaks"
            options={[
              { value: 'all', label: 'Any language' },
              ...languages.map((l) => ({ value: l, label: l })),
            ]}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>

        <div className="mt-3">
          {loading ? (
            <SkeletonGroup label="Loading the care team" className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} shape="card" className="h-[22rem]" />
              ))}
            </SkeletonGroup>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                (data?.length ?? 0) === 0
                  ? 'Profiles are not published yet'
                  : 'Nobody matches those filters'
              }
              action={
                (data?.length ?? 0) === 0 ? (
                  <div className="flex flex-wrap gap-1">
                    <a href={telHref()} className={buttonClasses('primary', 'md')} data-analytics="team-empty-call">
                      Call {brand.contact.phoneDisplay}
                    </a>
                    <Link to="/partner" className={buttonClasses('secondary', 'md')}>
                      Join the network
                    </Link>
                  </div>
                ) : null
              }
            >
              {(data?.length ?? 0) === 0
                ? 'We do not publish a profile until the person has agreed to appear here. Call a coordinator and we will tell you exactly who would be assigned to your booking, with their qualifications, before you commit to anything.'
                : 'Try widening one of the filters. If you need a specific language or a specific role, call us and we will tell you who is free.'}
            </EmptyState>
          ) : (
            <>
              <p className="sr-only" role="status" aria-live="polite">
                {filtered.length} professional{filtered.length === 1 ? '' : 's'} shown
              </p>
              <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <li key={p.id}>
                    <ProfessionalCard professional={p} showChecks />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Section>
    </>
  );
}
