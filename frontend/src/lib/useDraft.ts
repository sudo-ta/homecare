import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Form state that survives a refresh or a back-navigation.
 *
 * Spec 6.4 requires the booking flow to persist to sessionStorage so an
 * accidental refresh does not lose the entry. The reader is often stressed, on
 * a phone, at night; losing four steps of typing is how a booking becomes a
 * phone call to a competitor.
 *
 * sessionStorage rather than localStorage on purpose: the draft holds a
 * patient's name and condition, and it should not outlive the tab. It is
 * cleared explicitly on successful submission.
 */
export function useDraft<T extends object>(
  key: string,
  initial: T,
): [T, (patch: Partial<T>) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof sessionStorage === 'undefined') return initial;
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? { ...initial, ...(JSON.parse(raw) as Partial<T>) } : initial;
    } catch {
      // Corrupt or blocked storage must not stop the form rendering.
      return initial;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      sessionStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      // Private mode, or storage full. The form still works in memory.
    }
  }, [value]);

  const update = useCallback((patch: Partial<T>) => {
    setValue((prev) => ({ ...prev, ...patch }));
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(keyRef.current);
    } catch {
      // Nothing to do; the in-memory reset below is what matters.
    }
    setValue(initial);
    // initial is a stable literal at every call site, so it is safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, update, clear];
}
