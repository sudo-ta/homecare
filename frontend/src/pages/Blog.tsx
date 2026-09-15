import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { brand } from '@shared/brand.js';
import { EmptyState, Pagination, Skeleton, SkeletonGroup } from '@shared/ui/index.js';
import { cn } from '@shared/utils/index.js';
import { PageHero } from '@/components/SkyHero.js';
import { Seo, breadcrumbSchema } from '@/components/Seo.js';
import { getArticles } from '@/lib/api.js';
import { useApi } from '@/lib/useApi.js';

const PER_PAGE = 6;
const ALL = 'all';

export default function Blog() {
  const { data, loading } = useApi(getArticles, []);
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? ALL;
  const [page, setPage] = useState(Number(params.get('page') ?? 1));

  const categories = useMemo(() => [ALL, ...new Set((data ?? []).map((a) => a.category))], [data]);

  const filtered = useMemo(
    () => (data ?? []).filter((a) => category === ALL || a.category === category),
    [data, category],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function pickCategory(next: string) {
    const p = new URLSearchParams(params);
    if (next === ALL) p.delete('category');
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

      <PageHero
        crumb="Articles"
        title="What families ask us, written down properly"
        intro="Practical notes from the coordinators and nurses who do this work. Nothing here replaces advice from your own doctor."
      />

      <section className="bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-[clamp(1.375rem,3vw,2rem)] px-(--page-gutter) pt-[clamp(2rem,5vw,3.5rem)] pb-[clamp(3.25rem,7vw,6rem)]">
          <div className="flex flex-wrap items-center justify-between gap-1.75">
            <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-1">
              {categories.map((c) => {
                const selected = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => pickCategory(c)}
                    aria-pressed={selected}
                    className={cn(
                      'opt tap-target cursor-pointer rounded-pill border px-2 py-1.25 text-small whitespace-nowrap',
                      selected
                        ? 'border-blue bg-blue font-medium text-surface'
                        : 'border-line bg-surface text-pewter-text',
                    )}
                  >
                    {c === ALL ? 'All topics' : c}
                  </button>
                );
              })}
            </div>

            <p aria-live="polite" className="text-small text-pewter-text">
              {filtered.length === 1 ? '1 article' : `${filtered.length} articles`}
            </p>
          </div>

          {loading ? (
            <SkeletonGroup
              label="Loading articles"
              className="grid gap-[clamp(1rem,2.2vw,1.375rem)] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[15rem]" />
              ))}
            </SkeletonGroup>
          ) : shown.length === 0 ? (
            <EmptyState title="Nothing published in this category yet">
              Try another topic, or read everything by clearing the filter.
            </EmptyState>
          ) : (
            <ul className="grid gap-[clamp(1rem,2.2vw,1.375rem)] [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
              {shown.map((a) => (
                <li key={a.slug} className="flex">
                  <article className="card relative flex flex-1 flex-col gap-1.5 rounded-[22px] border border-line bg-surface p-[clamp(1.25rem,2.6vw,1.625rem)]">
                    <span className="flex flex-wrap items-baseline gap-1.25">
                      <span className="font-sans text-meta font-semibold tracking-[.12em] text-blue uppercase">
                        {a.category}
                      </span>
                      <span className="text-meta text-pewter-text">
                        {a.readingMinutes} min read
                      </span>
                    </span>

                    <h2 className="text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.16] tracking-[-.018em]">
                      <Link to={`/blog/${a.slug}`} className="text-ink no-underline">
                        {a.title}
                        {/* Stretches the link over the whole card, so the card is
                            one tab stop rather than a div with an onClick. */}
                        <span className="absolute inset-0" />
                      </Link>
                    </h2>

                    <p className="flex-1 text-small leading-[1.55] text-ink-soft">{a.excerpt}</p>

                    <span className="inline-flex items-center gap-1 text-small font-medium text-pewter-text">
                      Read the article
                      <svg
                        viewBox="0 0 20 20"
                        className="arw size-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M4.17 10h11.66M15.83 10 10 4.17M15.83 10 10 15.83" />
                      </svg>
                    </span>
                  </article>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <Pagination page={safePage} totalPages={totalPages} onPageChange={goToPage} />
          ) : null}
        </div>
      </section>
    </>
  );
}
