import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '../utils/cn.js';

export type ToastTone = 'info' | 'positive' | 'attention' | 'critical';

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Milliseconds. Pass null to require a manual dismiss. */
  duration?: number | null;
}

type ToastInput = Omit<ToastMessage, 'id'>;

interface ToastContextValue {
  toast: (t: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const TONES: Record<ToastTone, string> = {
  info: 'border-line bg-surface',
  positive: 'border-positive-lo bg-positive-lo',
  attention: 'border-attention-lo bg-attention-lo',
  critical: 'border-critical-lo bg-critical-lo',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      setItems((prev) => [...prev, { ...input, id }]);
      const duration = input.duration === undefined ? 6000 : input.duration;
      // Six seconds, not three. This audience includes readers who need
      // longer, and WCAG 2.2.1 wants enough time to read a transient message.
      if (duration !== null) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // The region is always mounted so assistive tech is already watching it
        // when a message arrives. Mounting the live region with the message is
        // the classic reason a toast is never announced.
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-1 p-2 md:inset-x-auto md:right-0 md:items-end"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'critical' ? 'alert' : 'status'}
            aria-live={t.tone === 'critical' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex w-full max-w-[26rem] items-start gap-1.5 rounded-card border p-2 shadow-elevated',
              'motion-safe:animate-[toast-in_180ms_cubic-bezier(0.2,0,0.2,1)]',
              TONES[t.tone],
            )}
          >
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="text-body font-medium text-ink">{t.title}</p>
              {t.description ? <p className="text-small text-ink-soft">{t.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss: ${t.title}`}
              className="tap-target -m-0.5 shrink-0 rounded-pill p-0.5 text-ink-soft hover:text-ink"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m4 4 8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
