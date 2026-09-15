import { cn } from '../utils/cn.js';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Used to build real hrefs so pages are crawlable and openable in a new tab. */
  buildHref?: (page: number) => string;
  className?: string;
}

/** Windowed page list with ellipses: 1 ... 4 5 6 ... 12 */
function pageWindow(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push('gap');
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push('gap');
  out.push(total);
  return out;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  buildHref,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  const item = (n: number) => {
    const current = n === page;
    const classes = cn(
      'inline-flex size-6 items-center justify-center rounded-pill text-body',
      'transition-colors duration-(--dur-state) ease-state',
      current
        ? 'bg-ink font-medium text-paper'
        : 'text-ink hover:bg-midnight-lo hover:text-ink',
    );
    const label = `Page ${n}`;

    return buildHref ? (
      <a
        href={buildHref(n)}
        aria-current={current ? 'page' : undefined}
        aria-label={label}
        onClick={(e) => {
          // Let modified clicks open a new tab normally.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          onPageChange(n);
        }}
        className={classes}
      >
        {n}
      </a>
    ) : (
      <button
        type="button"
        aria-current={current ? 'page' : undefined}
        aria-label={label}
        onClick={() => onPageChange(n)}
        className={classes}
      >
        {n}
      </button>
    );
  };

  const arrow = (dir: 'prev' | 'next') => {
    const target = dir === 'prev' ? page - 1 : page + 1;
    const disabled = dir === 'prev' ? page <= 1 : page >= totalPages;
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPageChange(target)}
        aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-pill',
          'transition-colors duration-(--dur-state) ease-state',
          'text-ink hover:bg-midnight-lo hover:text-ink',
          'disabled:cursor-not-allowed disabled:text-pewter-strong disabled:hover:bg-transparent',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          className={cn('size-2.5', dir === 'next' && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m10 4-4 4 4 4" />
        </svg>
      </button>
    );
  };

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-0.5', className)}>
      {arrow('prev')}
      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-0.5 text-ink-soft" aria-hidden="true">
            &hellip;
          </span>
        ) : (
          <span key={p}>{item(p)}</span>
        ),
      )}
      {arrow('next')}
    </nav>
  );
}
