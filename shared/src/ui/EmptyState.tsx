import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export interface EmptyStateProps {
  /** State the fact plainly. "No services in this area yet", not "Nothing here". */
  title: ReactNode;
  /** What the reader can do about it. Spec 5.7 wants a direction, not an apology. */
  children?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  /** `inline` for an empty slot inside a page; `page` for a whole route. */
  size?: 'inline' | 'page';
  className?: string;
}

/**
 * Empty is a designed state, not a blank div. Spec 6.2 is explicit that a
 * section with no data must render this rather than collapsing to nothing.
 */
export function EmptyState({
  title,
  children,
  action,
  icon,
  size = 'inline',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-1.5 rounded-card border border-dashed border-pewter-strong bg-surface',
        size === 'inline' ? 'p-3' : 'p-4 md:p-6',
        className,
      )}
    >
      {icon ? <div className="text-ink-soft">{icon}</div> : null}
      <h3 className={cn('text-ink', size === 'page' ? 'text-h2' : 'text-h3')}>{title}</h3>
      {children ? <div className="measure text-body text-ink-soft">{children}</div> : null}
      {action ? <div className="mt-0.5">{action}</div> : null}
    </div>
  );
}
