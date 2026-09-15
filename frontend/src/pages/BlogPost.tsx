import { Link, useParams } from 'react-router';
import { brand, telHref } from '@shared/brand.js';
import { Card, CardBody, Skeleton, SkeletonGroup, buttonClasses } from '@shared/ui/index.js';
import { ArticleBody } from '@/components/ArticleBody.js';
import { Section } from '@/components/Section.js';
import { Seo, articleSchema, breadcrumbSchema } from '@/components/Seo.js';
import { getArticle, getArticles } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { useApi } from '@/lib/useApi.js';
import NotFound from './NotFound.js';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { data: article, loading, error } = useApi(() => getArticle(slug), [slug]);
  const { data: all } = useApi(getArticles, []);

  if (loading) {
    return (
      <Section>
        <SkeletonGroup label="Loading article" className="flex flex-col gap-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </SkeletonGroup>
      </Section>
    );
  }

  if (error || !article) return <NotFound />;

  const related = (all ?? [])
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 2);

  return (
    <>
      <Seo
        title={`${article.title} - ${brand.name}`}
        description={article.excerpt}
        path={`/blog/${article.slug}`}
        structuredData={[
          articleSchema({
            title: article.title,
            description: article.excerpt,
            slug: article.slug,
            author: article.author,
            publishedAt: article.publishedAt,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/blog' },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />

      <Section spacing="tight">
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-0.5 text-small text-ink-soft">
            <li>
              <Link to="/" className="underline-offset-2 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/blog" className="underline-offset-2 hover:underline">
                Articles
              </Link>
            </li>
          </ol>
        </nav>

        <article>
          <header className="measure flex flex-col gap-1.5">
            <p className="text-small text-ink-soft">
              {article.category} &middot; {article.readingMinutes} min read
            </p>
            <h1 className="text-h1">{article.title}</h1>
            <p className="text-body-lg text-ink-soft">{article.excerpt}</p>
            <p className="text-small text-ink-soft">
              {article.author}, {article.authorRole} &middot;{' '}
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </p>
          </header>

          <div className="mt-4">
            <ArticleBody body={article.body} />
          </div>
        </article>
      </Section>

      <Section tone="tinted" spacing="tight">
        <div className="measure flex flex-col gap-1.5">
          <h2 className="text-h2">Need this arranged rather than explained?</h2>
          <p className="text-body text-ink-soft">
            A coordinator can tell you what is available at your pincode and what it would cost,
            usually in one call.
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Link to="/book" className={buttonClasses('primary', 'md')}>
              Request care
            </Link>
            <a href={telHref()} className={buttonClasses('secondary', 'md')} data-analytics="article-call">
              Call {brand.contact.phoneDisplay}
            </a>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-4">
            <h2 className="text-h3">More on {article.category.toLowerCase()}</h2>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {related.map((a) => (
                <li key={a.slug}>
                  <Card className="h-full">
                    <CardBody className="flex flex-col gap-1">
                      <h3 className="text-h3">
                        <Link to={`/blog/${a.slug}`} className="text-ink hover:text-ink">
                          {a.title}
                        </Link>
                      </h3>
                      <p className="text-body text-ink-soft">{a.excerpt}</p>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>
    </>
  );
}
