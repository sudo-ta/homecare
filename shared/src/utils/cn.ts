/**
 * Joins class names, dropping falsy entries.
 *
 * Deliberately not tailwind-merge: the stock palette is cleared in theme.css,
 * so tailwind-merge's conflict table (which is built around `bg-blue-500` style
 * names) has nothing to match and would add weight for no benefit. Components
 * here put caller-supplied classes last and let the cascade decide.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  let out = '';
  for (const v of values) {
    if (!v && v !== 0) continue;
    out = out ? `${out} ${v}` : String(v);
  }
  return out;
}
