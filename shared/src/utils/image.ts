/**
 * Client-side image handling for the document uploads in spec 6.5.
 *
 * Applicants photograph certificates on a phone and send them over a patchy
 * connection. A 6MB camera JPEG that compresses to 400KB is the difference
 * between an application that completes and one that times out.
 */

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

/**
 * What the uploader accepts.
 *
 * HEIC is on the list because iPhones produce it by default. Spec 6.5 is
 * explicit that rejecting it silently loses applicants. Browsers other than
 * Safari cannot decode HEIC, so it is passed through uncompressed and shown
 * as a file chip rather than a thumbnail, instead of being refused.
 */
export const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
] as const;

export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,image/*,application/pdf';

/** Some browsers report an empty type for .heic, so the extension is the fallback. */
export function isHeic(file: File): boolean {
  if (file.type === 'image/heic' || file.type === 'image/heif') return true;
  return /\.hei[cf]$/i.test(file.name);
}

export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/** Only these can go through a canvas, so only these can be compressed or previewed. */
export function isCanvasDecodable(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type);
}

export function isAcceptedType(file: File): boolean {
  if (isHeic(file) || isPdf(file)) return true;
  return (ACCEPTED_MIME as readonly string[]).includes(file.type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface CompressOptions {
  /** Longest edge in pixels. 2000 keeps a certificate readable. */
  maxEdge?: number;
  quality?: number;
  /** Below this, compressing costs more than it saves. */
  skipBelowBytes?: number;
}

/**
 * Shrinks a photo before upload. Returns the original untouched if it is a PDF,
 * a HEIC, already small, or if the result would be no smaller.
 *
 * Re-encoding through a canvas also drops EXIF, which removes the GPS
 * coordinates a phone writes into a photo taken in someone's home. The server
 * strips metadata again on receipt; this is the first of the two passes.
 */
export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const { maxEdge = 2000, quality = 0.82, skipBelowBytes = 300 * 1024 } = opts;

  if (!isCanvasDecodable(file) || file.size <= skipBelowBytes) return file;

  let bitmap: ImageBitmap;
  try {
    // imageOrientation honours the EXIF rotation flag before we discard it,
    // otherwise sideways phone photos stay sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
}

/** Object URL for a preview, or null for formats the browser cannot draw. */
export function previewUrl(file: File): string | null {
  return isCanvasDecodable(file) ? URL.createObjectURL(file) : null;
}
