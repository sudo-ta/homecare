import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import { cn } from '../utils/cn.js';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
  value?: string;
  onChange?: (id: string) => void;
  label: string;
  className?: string;
}

/**
 * Tab list with the arrow-key navigation the WAI-ARIA pattern requires:
 * one tab stop for the whole list, arrows move between tabs, Home and End
 * jump to the ends. Tabbing out lands on the panel, not on the next tab.
 */
export function Tabs({ items, defaultTabId, value, onChange, label, className }: TabsProps) {
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [internal, setInternal] = useState(defaultTabId ?? items[0]?.id ?? '');
  const active = value ?? internal;

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const onKeyDown = (e: ReactKeyboardEvent, index: number) => {
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    const target = items[next];
    if (!target) return;
    select(target.id);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="flex gap-0.5 overflow-x-auto border-b border-line">
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${base}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'shrink-0 border-b-2 px-1.5 py-1.5 text-body whitespace-nowrap',
                'transition-colors duration-(--dur-state) ease-state',
                selected
                  ? 'border-ink font-medium text-ink'
                  : 'border-transparent text-ink-soft hover:text-ink',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-panel-${item.id}`}
          aria-labelledby={`${base}-tab-${item.id}`}
          hidden={item.id !== active}
          tabIndex={0}
          className="pt-2"
        >
          {item.id === active ? item.content : null}
        </div>
      ))}
    </div>
  );
}
