import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export type AlertTone = 'info' | 'positive' | 'attention' | 'critical';

const TONES: Record<AlertTone, { box: string; icon: string; path: string }> = {
  info: {
    box: 'border-line bg-midnight-lo',
    icon: 'text-ink',
    path: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4h1.5v1.5h-1.5V4Zm0 3h1.5v5h-1.5V7Z',
  },
  positive: {
    box: 'border-positive-lo bg-positive-lo',
    icon: 'text-positive',
    path: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm-.8 9.2L4.8 8.3l1.1-1.1 1.3 1.3 3.1-3.1 1.1 1.1-4.2 4.2Z',
  },
  attention: {
    box: 'border-attention-lo bg-attention-lo',
    icon: 'text-attention',
    path: 'M8 1.2 15 14H1L8 1.2Zm-.75 4.3v4h1.5v-4h-1.5Zm0 5.2v1.5h1.5v-1.5h-1.5Z',
  },
  critical: {
    box: 'border-critical-lo bg-critical-lo',
    icon: 'text-critical',
    path: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.5h1.5v5h-1.5v-5Zm0 6.25h1.5v1.5h-1.5v-1.5Z',
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children: ReactNode;
  /** A single next step. Errors should say what to do, not only what happened. */
  action?: ReactNode;
  /**
   * Announce to assistive tech when this appears. Use for validation summaries
   * and failed submissions; leave off for alerts present on first render.
   */
  live?: boolean;
  className?: string;
}

export function Alert({ tone = 'info', title, children, action, live, className }: AlertProps) {
  const t = TONES[tone];
  return (
    <div
      className={cn('flex items-start gap-1.5 rounded-card border p-2', t.box, className)}
      {...(live
        ? { role: tone === 'critical' ? 'alert' : 'status', 'aria-live': 'polite' as const }
        : {})}
    >
      <svg
        viewBox="0 0 16 16"
        className={cn('mt-0.25 size-2.5 shrink-0', t.icon)}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={t.path} />
      </svg>
      <div className="flex flex-col gap-1">
        <div>
          {title ? <p className="text-body font-semibold text-ink">{title}</p> : null}
          <div className="measure text-body text-ink">{children}</div>
        </div>
        {action}
      </div>
    </div>
  );
}
