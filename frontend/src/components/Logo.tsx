import { brand } from '@shared/brand.js';

/**
 * Wordmark.
 *
 * PLACEHOLDER, and deliberately unresolved: the name is not decided, so there is
 * nothing to design a wordmark around yet. The mark is a doorway with a
 * roofline - home, not hospital - and the text is whatever `brand.name`
 * currently says, which is a bracketed token until someone picks a name.
 *
 * Drawn in --ink, matching the imported theme, where the wordmark is set in
 * the display face at the same weight as the headings.
 *
 * Nothing else in the codebase draws the logo, so this file and brand.ts are
 * the whole swap when the identity exists.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 208 32"
      role="img"
      aria-label={brand.name}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Doorway, open at the base. */}
      <path
        d="M4 28V15.5L14 6l10 9.5V28"
        stroke="var(--color-ink)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 28v-7.5a3.2 3.2 0 0 1 6.4 0V28"
        stroke="var(--color-ink)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* One text element rather than two. The previous version offset a second
          word by a multiple of the first word's character count, which only
          lined up for one specific name. */}
      <text
        x="34"
        y="22.5"
        fontFamily="Newsreader, Georgia, serif"
        fontSize="19"
        fontWeight="400"
        fill="var(--color-ink)"
      >
        {brand.name}
      </text>
    </svg>
  );
}
