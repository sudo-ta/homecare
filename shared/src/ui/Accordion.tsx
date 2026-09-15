import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { cn } from '../utils/cn.js';

export interface AccordionItem {
  id: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: string[];
  /** Opening one closes the others. */
  single?: boolean;
  className?: string;
  /** Rendered around each question. Keeps the page heading order correct. */
  headingLevel?: 'h2' | 'h3' | 'h4';
}

export function Accordion({
  items,
  defaultOpen = [],
  single = false,
  className,
  headingLevel: Heading = 'h3',
}: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultOpen));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = single ? new Set<string>() : new Set(prev);
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const btnId = `${base}-${item.id}-btn`;
        const panelId = `${base}-${item.id}-panel`;
        return (
          <div key={item.id}>
            <Heading className="text-body">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-2 py-2 text-left text-body font-medium text-ink transition-colors duration-(--dur-state) ease-state hover:text-ink"
              >
                <span>{item.question}</span>
                <svg
                  viewBox="0 0 16 16"
                  className={cn(
                    'size-2.5 shrink-0 text-ink-soft transition-transform duration-(--dur-state) ease-state',
                    isOpen && 'rotate-180',
                  )}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4 6 4 4 4-4" />
                </svg>
              </button>
            </Heading>

            {/* Animating grid-template-rows from 0fr to 1fr is the one way to
                transition to content height without measuring it in JS. */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              // `inert`, not `hidden`: display:none would cancel the collapse
              // transition, while inert still takes the collapsed panel out of
              // the tab order and the accessibility tree.
              inert={!isOpen}
              className={cn(
                'grid transition-[grid-template-rows] duration-(--dur-state) ease-state',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="measure pb-2 text-body text-ink-soft">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
