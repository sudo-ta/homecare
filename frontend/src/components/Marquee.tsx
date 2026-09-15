import { useEffect, useRef, useState } from 'react';
import { usePauseWhenOffscreen } from '@/lib/motion.js';

export interface MarqueeProps {
  items: { name: string; logoUrl: string }[];
  /** Pixels per second. Slow enough to read a logo as it passes. */
  speed?: number;
}

/**
 * Hospital affiliation marquee.
 *
 * Driven by a CSS keyframe rather than requestAnimationFrame: the compositor
 * runs a transform keyframe off the main thread, so it survives React
 * rendering and does not compete with the booking form for frames on a
 * mid-range Android.
 *
 * The track is duplicated once and translates exactly -50%, which is what makes
 * the loop seamless. Duration is derived from the measured width so the speed
 * is constant regardless of how many logos there are - a fixed duration would
 * make three logos crawl and twelve logos sprint.
 *
 * Pauses on hover and whenever it is off-screen. Disabled entirely under
 * reduced motion, where it becomes a static wrapped row.
 *
 * Renders nothing when there are no affiliations. Spec 6.2 of the design brief:
 * logos only with permission, and an empty slot is omitted rather than filled.
 */
export function Marquee({ items, speed = 50 }: MarqueeProps) {
  const { ref, paused, setHovered } = usePauseWhenOffscreen<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<string>();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      // scrollWidth covers both copies, so halving it gives one loop's travel.
      const distance = track.scrollWidth / 2;
      if (distance > 0) setDuration(`${distance / speed}s`);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [speed, items.length]);

  if (items.length === 0) return null;

  // Halved on mobile: fewer passes of the same logos, less to paint.
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
  const shown = isNarrow ? items.slice(0, Math.max(1, Math.ceil(items.length / 2))) : items;

  return (
    <div
      ref={ref}
      className="overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={trackRef}
        data-motion="marquee"
        data-paused={paused ? '' : undefined}
        style={duration ? { ['--marquee-duration' as string]: duration } : undefined}
        className="flex w-max items-center gap-6"
      >
        {/* Two identical copies. The second is hidden from assistive tech so a
            screen reader does not read the same list of hospitals twice. */}
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex items-center gap-6"
            aria-hidden={copy === 1 ? 'true' : undefined}
          >
            {shown.map((item) => (
              <li key={`${copy}-${item.name}`} className="shrink-0">
                <img
                  src={item.logoUrl}
                  alt={copy === 0 ? item.name : ''}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="h-4 w-auto"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
