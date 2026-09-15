import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { brand } from '@shared/brand.js';
import {
  Card,
  CardBody,
  CardLinkOverlay,
  EmptyState,
  Pagination,
  Skeleton,
  SkeletonGroup,
} from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import { Section, SectionHeading } from '@/components/Section.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { getArticles } from '@/lib/api.js';
import { formatDateShort } from '@/lib/format.js';
import { useApi } from '@/lib/useApi.js';

const PER_PAGE = 6;

export default function Blog() {
  const { data, loading } = useApi(getArticles, []);
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? 'all';
  const [page, setPage] = useState(Number(params.get('page') ?? 1));

  const categories = useMemo(
    () => ['all', ...new Set((data ?? []).map((a) => a.category))],
    [data],
  );

  const filtered = useMemo(
    () => (data ?? []).filter((a) => category === 'all' || a.category === category),
    [data, category],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function pickCategory(next: string) {
    const p = new URLSearchParams(params);
    if (next === 'all') p.delete('category');
    else p.set('category', next);
    p.delete('page');
    setParams(p, { replace: true });
    setPage(1);
  }

  function goToPage(next: number) {
    const p = new URLSearchParams(params);
    if (next === 1) p.delete('page');
    else p.set('page', String(next));
    setParams(p);
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return (
    <>
      <Seo
        title={`Articles - ${brand.name}`}
        description="Practical writing for families arranging care at home: discharge checklists, making a house safe, recovery after surgery, and how to judge a provider."
        path="/blog"
        structuredData={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/blog' },
          ]),
        ]}
      />

      <Section spacing="tight">
        <SectionHeading
          as="h2"
          title={<span className="text-h1">Articles</span>}
          intro="Written for the person arranging care at short notice, who needs a practical answer tonight."
        />
      </Section>

      <Section spacing="tight" className="!pt-0">
        {categories.length > 1 ? (
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-0.5 border-y border-line py-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pickCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'rounded-pill border px-1.5 py-1 text-small transition-colors duration-(--dur-state) ease-state',
                  category === c
                    ? 'border-ink bg-ink text-paper'
                    : 'border-pewter-strong bg-surface text-ink hover:border-ink hover:text-ink',
                )}
              >
                {c === 'all' ? 'Everything' : c}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3">
          {loading ? (
            <SkeletonGroup label="Loading articles" className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} shape="card" className="h-[15rem]" />
              ))}
            </SkeletonGroup>
          ) : shown.length === 0 ? (
            <EmptyState title="Nothing published in this category yet">
              Try another category, or read everything from the start.
            </EmptyState>
          ) : (
            <>
              <ul className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((a) => (
                  <li key={a.slug}>
                    <Card interactive className="h-full">
                      <CardBody className="flex h-full flex-col gap-1.5">
                        <p className="text-small text-ink-soft">
                          {a.category} &middot; {a.readingMinutes} min read
                        </p>
                        <h2 className="text-h3">
                          <Link to={`/blog/${a.slug}`} className="text-ink hover:text-ink">
                            {a.title}
                            <CardLinkOverlay />
                          </Link>
                        </h2>
                        <p className="flex-1 text-body text-ink-soft">{a.excerpt}</p>
                        <p className="text-small text-ink-soft">
                          {a.author} &middot; {formatDateShort(a.publishedAt)}
                        </p>
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ul>

              {totalPages > 1 ? (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    buildHref={(n) => (n === 1 ? '/blog' : `/blog?page=${n}`)}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </Section>
    </>
  );
}
