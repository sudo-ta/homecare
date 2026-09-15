import { useEffect, useRef, useState } from 'react';

/**
 * True only on the first render of a given key in this browsing session.
 *
 * The hero reveal runs once and must not replay when someone navigates to a
 * service page and comes back - a headline that re-performs on every internal
 * navigation is the tell of an effect that was added without being thought
 * about.
 *
 * The read is a lazy initialiser and the write is an effect, on purpose: React
 * StrictMode double-invokes state initialisers in development, so writing there
 * would mark the session as seen before the first render finished and the
 * animation would never run locally.
 *
 * If sessionStorage throws (private mode, blocked storage) this returns false
 * and the page renders in its final state. Losing an animation is the correct
 * failure.
 */
export function useFirstVisitThisSession(key: string): boolean {
  const [isFirst] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    try {
      return sessionStorage.getItem(key) === null;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // Nothing to do. The flag is an optimisation, not state we depend on.
    }
  }, [key]);

  return isFirst;
}

/**
 * Reveals an element once when it first crosses into view.
 *
 * Deliberately IntersectionObserver and a CSS transition rather than a
 * scroll-linked library. Native scroll never desyncs; a scroll proxy does, and
 * when it does the content stays at opacity 0 and the visitor sees a blank
 * screen. That failure mode is unrecoverable and is not worth any amount of
 * polish.
 *
 * Fires once and is never reversed. Below 768px the CSS opts out entirely, so
 * this still runs but has nothing to do.
 */
export function useRevealOnce<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  revealed: boolean;
} {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || revealed) return;

    // No observer, or motion is unwanted: show it and stop.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed]);

  return { ref, revealed };
}

/**
 * Pauses a continuously running element while it is off-screen.
 *
 * A marquee that keeps animating below the fold burns battery on exactly the
 * mid-range Android this product is used on, for something nobody can see.
 */
export function usePauseWhenOffscreen<T extends HTMLElement>(): {
  ref: React.RefObject<T | null>;
  paused: boolean;
  setHovered: (hovered: boolean) => void;
} {
  const ref = useRef<T>(null);
  const [offscreen, setOffscreen] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setOffscreen(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, paused: offscreen || hovered, setHovered };
}

/**
 * The hero settle.
 *
 * The hero recedes as the page scrolls: a small scale-down, a lift and a fade
 * over the first 70% of the viewport, so it reads as depth rather than as the
 * block sliding away. Driven per frame in JS rather than with animation-timeline
 * because support for that is still thin.
 *
 * Off under reduced motion and below 768px, where a scroll-linked transform on
 * a full-bleed gradient costs frames on a mid-range Android and gains nothing.
 */
export function useHeroSettle(): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const span = window.innerHeight * 0.7;
      const p = Math.min(1, Math.max(0, window.scrollY / span));
      const eased = p * p * (3 - 2 * p);
      el.style.transform = `scale(${(1 - eased * 0.055).toFixed(4)}) translateY(${(
        -eased * 26
      ).toFixed(2)}px)`;
      el.style.opacity = (1 - eased * 0.55).toFixed(3);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
