import type { ReactNode } from 'react';

/**
 * Renders the markdown-lite used by article bodies: ## headings, - list items,
 * **bold** runs, and blank-line separated paragraphs.
 *
 * Hand-written rather than pulling a markdown library because the input is our
 * own editorial content, not user input, and the whole grammar is four rules.
 * A parser here would add tens of kilobytes to a route that is mostly text.
 *
 * Nothing is rendered as raw HTML, so an article body cannot inject markup even
 * if one later arrives from the CMS.
 */
export function ArticleBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/);

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="mt-2 text-h2">
              {inline(trimmed.slice(3))}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="mt-1 text-h3">
              {inline(trimmed.slice(4))}
            </h3>
          );
        }

        if (/^-\s/m.test(trimmed) && trimmed.split('\n').every((l) => l.trim().startsWith('- '))) {
          return (
            <ul key={i} className="measure flex list-disc flex-col gap-1 pl-3">
              {trimmed.split('\n').map((line, j) => (
                <li key={j} className="text-body text-ink">
                  {inline(line.trim().slice(2))}
                </li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s/m.test(trimmed) && trimmed.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={i} className="measure flex list-decimal flex-col gap-1 pl-3">
              {trimmed.split('\n').map((line, j) => (
                <li key={j} className="text-body text-ink">
                  {inline(line.trim().replace(/^\d+\.\s/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="measure text-body text-ink">
            {inline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/** Splits **bold** runs out of a line of text. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
