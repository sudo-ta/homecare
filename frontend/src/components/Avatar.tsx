import { cn } from '@shared/utils/index.js';
import { initials } from '@/lib/format.js';

export interface AvatarProps {
  name: string;
  photoUrl: string | null;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * A person's photograph, or their initials.
 *
 * Never a stock face and never a generic silhouette. This page is where a
 * family decides whether to let a stranger into the house, so a photograph
 * here is a claim about who is coming. Until there is a real one, initials are
 * the honest placeholder.
 */
export function Avatar({ name, photoUrl, size = 'md', className }: AvatarProps) {
  const px = size === 'lg' ? 96 : 64;

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Photograph of ${name}`}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        className={cn(
          'shrink-0 rounded-pill object-cover',
          size === 'lg' ? 'size-12' : 'size-8',
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-pill bg-midnight-lo font-medium text-ink',
        size === 'lg' ? 'size-12 text-h3' : 'size-8 text-body',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
