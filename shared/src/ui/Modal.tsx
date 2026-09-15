import type { MouseEvent as ReactMouseEvent, ReactNode, SyntheticEvent } from 'react';
import { useCallback, useEffect, useId, useRef } from 'react';
import { cn } from '../utils/cn.js';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Off for a confirmation the user must answer deliberately. */
  dismissOnBackdrop?: boolean;
  className?: string;
}

const SIZES = { sm: 'max-w-[26rem]', md: 'max-w-[34rem]', lg: 'max-w-[48rem]' } as const;

/**
 * Built on the native <dialog> element.
 *
 * showModal() gives the focus trap, the Escape handling, the inert background
 * and the top-layer stacking for free. A hand-rolled trap is the usual source
 * of keyboard dead-ends in a modal, and there is no reason to write one.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissOnBackdrop = true,
  className,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      // The page behind must not scroll while a modal is up.
      document.body.style.overflow = 'hidden';
    } else if (!open && el.open) {
      el.close();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Escape fires the dialog's own cancel event; route it through onClose so
  // the parent's state stays the single source of truth.
  const handleCancel = useCallback(
    (e: SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onClose();
    },
    [onClose],
  );

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (!dismissOnBackdrop) return;
      // A click landing on the dialog element itself is a backdrop click:
      // the panel inside stops anything aimed at the content.
      if (e.target === ref.current) onClose();
    },
    [dismissOnBackdrop, onClose],
  );

  return (
    <dialog
      ref={ref}
      onCancel={handleCancel}
      onClick={handleClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        'w-[calc(100vw-2rem)] bg-transparent p-0 text-ink backdrop:bg-ink/50',
        'my-auto mx-auto',
        SIZES[size],
        className,
      )}
    >
      <div className="flex max-h-[85vh] flex-col rounded-card border border-line bg-surface shadow-elevated">
        <div className="flex items-start justify-between gap-2 border-b border-line p-2 md:px-3">
          <div className="flex flex-col gap-0.5">
            <h2 id={titleId} className="text-h3">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-small text-ink-soft">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="tap-target -m-0.5 shrink-0 rounded-pill p-0.5 text-ink-soft transition-colors duration-(--dur-state) ease-state hover:bg-midnight-lo hover:text-ink"
          >
            <svg
              viewBox="0 0 16 16"
              className="size-2.5"
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

        {children ? <div className="overflow-y-auto p-2 md:p-3">{children}</div> : null}

        {footer ? (
          <div className="flex flex-wrap justify-end gap-1 border-t border-line p-2 md:px-3">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
