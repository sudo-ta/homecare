import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import type { ServiceCategory } from '@shared/types/index.js';
import { Alert, Button, EmptyState, Skeleton, SkeletonGroup, buttonClasses } from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { ServiceCard } from '@/components/ServiceCard.js';
import { checkCoverage, getServices } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

const CATEGORIES: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'caregiving', label: 'Caregiving' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'doctor-visit', label: 'Doctor visits' },
  { value: 'diagnostics', label: 'Diagnostics' },
  { value: 'equipment', label: 'Equipment' },
];

export default function Services() {
  const [params, setParams] = useSearchParams();
  const category = (params.get('category') ?? 'all') as ServiceCategory | 'all';
  const pincodeFilter = params.get('pincode') ?? '';

  const { data, loading, error, reload } = useApi(getServices, []);
  const [pincode, setPincode] = useState(pincodeFilter);
  const [availableSlugs, setAvailableSlugs] = useState<string[] | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (category !== 'all') list = list.filter((s) => s.category === category);
    if (availableSlugs) list = list.filter((s) => availableSlugs.includes(s.slug));
    return list;
  }, [data, category, availableSlugs]);

  function setCategory(next: ServiceCategory | 'all') {
    const p = new URLSearchParams(params);
    if (next === 'all') p.delete('category');
    else p.set('category', next);
    setParams(p, { replace: true });
  }

  async function applyPincode(e: React.FormEvent) {
    e.preventDefault();
    const value = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(value)) {
      setPincodeError('A pincode is six digits, like 380009.');
      return;
    }
    setPincodeError(null);
    setChecking(true);
    try {
      const res = await checkCoverage(value);
      if (!res.data?.covered) {
        setAvailableSlugs([]);
        setPincodeError(null);
      } else {
        setAvailableSlugs(res.data.services.map((s) => s.slug));
      }
      const p = new URLSearchParams(params);
      p.set('pincode', value);
      setParams(p, { replace: true });
    } catch {
      setPincodeError('We could not check that pincode just now.');
    } finally {
      setChecking(false);
    }
  }

  function clearPincode() {
    setAvailableSlugs(null);
    setPincode('');
    setPincodeError(null);
    const p = new URLSearchParams(params);
    p.delete('pincode');
    setParams(p, { replace: true });
  }

  return (
    <>
      <Seo
        title={`Services - ${brand.name}`}
        description="Home nursing, caregiving, physiotherapy, doctor visits, lab tests and equipment. What each one covers, what it does not, and what it costs."
        path="/services"
        structuredData={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">What we do</span>}
          intro="Each page says what the service covers, what it explicitly does not, and what moves the price. Filter by what you need, or by whether we reach your street."
        />
      </Section>

      <Section spacing="tight" className="!pt-0">
        <div className="flex flex-col gap-2 border-y border-line py-2 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-0.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={cn(
                  'rounded-pill border px-1.5 py-1 text-small transition-colors duration-(--dur-state) ease-state',
                  category === c.value
                    ? 'border-ink bg-ink text-paper'
                    : 'border-pewter-strong bg-surface text-ink hover:border-ink hover:text-ink',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          <form onSubmit={applyPincode} className="flex items-end gap-1" noValidate>
            <div className="flex flex-col gap-0.5">
              <label htmlFor="svc-pincode" className="text-small font-medium text-ink">
                Available at my pincode
              </label>
              <input
                id="svc-pincode"
                inputMode="numeric"
                maxLength={6}
                placeholder="380009"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ''));
                  setPincodeError(null);
                }}
                aria-invalid={pincodeError ? true : undefined}
                aria-describedby={pincodeError ? 'svc-pincode-error' : undefined}
                className="h-6 w-[9rem] rounded-control border border-pewter-strong bg-surface px-1.5 text-body text-ink placeholder:text-ink-soft hover:border-ink aria-[invalid]:border-critical"
              />
            </div>
            <Button type="submit" variant="secondary" loading={checking} loadingLabel="Checking">
              Check
            </Button>
            {availableSlugs ? (
              <Button type="button" variant="ghost" onClick={clearPincode}>
                Clear
              </Button>
            ) : null}
          </form>
        </div>

        {pincodeError ? (
          <p id="svc-pincode-error" className="mt-1 text-small text-critical">
            {pincodeError}
          </p>
        ) : null}

        <div className="mt-3">
          {loading ? (
            <SkeletonGroup label="Loading services" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} shape="card" className="h-[16rem]" />
              ))}
            </SkeletonGroup>
          ) : error ? (
            <Alert
              tone="critical"
              title="We could not load the service list"
              live
              action={
                <Button variant="secondary" onClick={reload}>
                  Try again
                </Button>
              }
            >
              <p>That is a problem at our end. Call {brand.contact.phoneDisplay} and we will talk it through.</p>
            </Alert>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={
                availableSlugs
                  ? `No services at ${pincode} yet`
                  : 'Nothing matches that filter'
              }
              action={
                availableSlugs ? (
                  <div className="flex flex-wrap gap-1">
                    <Link to="/coverage" className={buttonClasses('primary', 'md')}>
                      Join the waitlist for this area
                    </Link>
                    <Button variant="secondary" onClick={clearPincode}>
                      Show everything again
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" onClick={() => setCategory('all')}>
                    Show everything
                  </Button>
                )
              }
            >
              {availableSlugs ? (
                <>
                  We do not cover {pincode} yet. Tell us where you need care and we will let you know
                  when we do, or call{' '}
                  <a href={telHref()} className="font-medium text-ink underline underline-offset-2">
                    {brand.contact.phoneDisplay}
                  </a>{' '}
                  and we will see what we can arrange.
                </>
              ) : (
                'Try a different category, or clear the pincode filter.'
              )}
            </EmptyState>
          ) : (
            <>
              <p className="sr-only" role="status" aria-live="polite">
                {filtered.length} service{filtered.length === 1 ? '' : 's'} shown
              </p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <li key={s.slug}>
                    <ServiceCard service={s} />
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
