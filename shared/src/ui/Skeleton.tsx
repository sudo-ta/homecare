import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

export interface SkeletonProps {
  className?: string;
  /** Rounded like the thing it stands in for. */
  shape?: 'text' | 'card' | 'feature' | 'panel' | 'media' | 'circle';
}

const SHAPES = {
  text: 'rounded-control h-2',
  card: 'rounded-card',
  feature: 'rounded-feature',
  panel: 'rounded-panel',
  media: 'rounded-media',
  circle: 'rounded-pill aspect-square',
} as const;

/**
 * A loading placeholder that reserves the final layout, so filling it in does
 * not shift the page. The CLS budget in spec 9 is 0.1 and unreserved async
 * content is the usual way that gets blown.
 *
 * The pulse is motion-safe: under prefers-reduced-motion it holds still, and
 * the aria-busy container it sits in is what actually announces loading.
 */
export function Skeleton({ className, shape = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn('bg-midnight-lo motion-safe:animate-pulse', SHAPES[shape], className)}
      aria-hidden="true"
    />
  );
}

/**
 * Wraps a group of skeletons. Marks the region busy and gives assistive tech
 * one message instead of a dozen empty boxes.
 */
export function SkeletonGroup({
  label = 'Loading',
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div aria-busy="true" aria-live="polite" aria-label={label} className={className}>
      {children}
    </div>
  );
}
