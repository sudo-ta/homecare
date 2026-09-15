import type { DragEvent, ReactNode } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../utils/cn.js';
import {
  ACCEPT_ATTR,
  MAX_FILE_BYTES,
  compressImage,
  formatBytes,
  isAcceptedType,
  isHeic,
  isPdf,
  previewUrl,
} from '../utils/image.js';
import { Field } from './Field.js';

export type UploadStatus = 'pending' | 'compressing' | 'uploading' | 'done' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0 to 100. */
  progress: number;
  error?: string;
  /** Storage key returned by the API once the upload completes. */
  key?: string;
  previewUrl: string | null;
}

export interface FileUploadProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optionalHint?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /**
   * Performs the actual upload and reports progress. Left to the caller so this
   * component stays transport-agnostic: the real one issues a pre-signed URL
   * and PUTs straight to object storage, never through the API process.
   */
  onUpload?: (file: File, onProgress: (pct: number) => void) => Promise<{ key: string }>;
  className?: string;
}

export function FileUpload({
  label,
  hint,
  error,
  required,
  optionalHint,
  multiple = false,
  maxFiles = 5,
  value,
  onChange,
  onUpload,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Object URLs are leaked memory until revoked.
  const urls = useRef<string[]>([]);
  useEffect(() => {
    const current = urls.current;
    return () => {
      for (const u of current) URL.revokeObjectURL(u);
    };
  }, []);

  // `value` is read inside async work, so it is held in a ref to avoid
  // updating against a stale snapshot mid-upload.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const patch = useCallback(
    (id: string, p: Partial<UploadedFile>) => {
      latest.current = latest.current.map((f) => (f.id === id ? { ...f, ...p } : f));
      onChange(latest.current);
    },
    [onChange],
  );

  const accept = useCallback(
    async (incoming: FileList | File[]) => {
      const room = maxFiles - value.length;
      const chosen = Array.from(incoming).slice(0, multiple ? room : 1);
      if (chosen.length === 0) return;

      const next: UploadedFile[] = [];
      for (const file of chosen) {
        const id = crypto.randomUUID();

        if (!isAcceptedType(file)) {
          next.push({
            id,
            file,
            status: 'error',
            progress: 0,
            previewUrl: null,
            error: 'That file type is not accepted. Use a PDF, JPG, PNG or HEIC.',
          });
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          next.push({
            id,
            file,
            status: 'error',
            progress: 0,
            previewUrl: null,
            error: `That file is ${formatBytes(file.size)}. The limit is 10 MB.`,
          });
          continue;
        }
        next.push({ id, file, status: 'pending', progress: 0, previewUrl: null });
      }

      const merged = multiple ? [...value, ...next] : next;
      latest.current = merged;
      onChange(merged);
      setAnnouncement(`${next.length} file${next.length === 1 ? '' : 's'} added`);

      for (const entry of next) {
        if (entry.status === 'error') continue;
        try {
          patch(entry.id, { status: 'compressing' });
          const prepared = await compressImage(entry.file);
          const url = previewUrl(prepared);
          if (url) urls.current.push(url);
          patch(entry.id, { file: prepared, previewUrl: url });

          if (!onUpload) {
            patch(entry.id, { status: 'done', progress: 100 });
            continue;
          }

          patch(entry.id, { status: 'uploading', progress: 0 });
          const { key } = await onUpload(prepared, (pct) => patch(entry.id, { progress: pct }));
          patch(entry.id, { status: 'done', progress: 100, key });
        } catch {
          patch(entry.id, {
            status: 'error',
            error: 'That upload did not finish. Check your connection and try again.',
          });
        }
      }
    },
    [maxFiles, multiple, onChange, onUpload, patch, value],
  );

  const remove = (id: string) => {
    const gone = value.find((f) => f.id === id);
    if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl);
    latest.current = value.filter((f) => f.id !== id);
    onChange(latest.current);
    setAnnouncement(`${gone?.file.name ?? 'File'} removed`);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) void accept(e.dataTransfer.files);
  };

  const full = value.length >= maxFiles;

  return (
    <Field
      as="fieldset"
      label={label}
      hint={hint}
      error={error}
      required={required}
      optionalHint={optionalHint}
      hintId={hintId}
      errorId={errorId}
      className={className}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center gap-1 rounded-card border border-dashed p-3 text-center',
          'transition-colors duration-(--dur-state) ease-state',
          dragging ? 'border-ink bg-midnight-lo' : 'border-pewter-strong bg-surface',
          full && 'opacity-60',
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={ACCEPT_ATTR}
          multiple={multiple}
          disabled={full}
          aria-describedby={cn(errorId, hintId) || undefined}
          onChange={(e) => {
            if (e.target.files) void accept(e.target.files);
            // Reset so picking the same file twice still fires a change.
            e.target.value = '';
          }}
        />

        <p className="text-body text-ink">
          <label
            htmlFor={inputId}
            className="cursor-pointer font-medium text-ink underline underline-offset-2"
          >
            Choose a file
          </label>
          <span className="text-ink-soft"> or drag it here</span>
        </p>
        <p className="text-small text-ink-soft">PDF, JPG, PNG or HEIC. Up to 10 MB each.</p>

        {/* A separate camera entry point: on a phone this opens the camera
            directly, which is how most applicants will send a certificate. */}
        <label
          htmlFor={`${inputId}-camera`}
          className="tap-target mt-0.5 inline-flex cursor-pointer items-center gap-0.5 text-small text-ink underline underline-offset-2 md:hidden"
        >
          <svg viewBox="0 0 16 16" className="size-2" fill="currentColor" aria-hidden="true">
            <path d="M6 2h4l1 1.5h2A1.5 1.5 0 0 1 14.5 5v7A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12V5A1.5 1.5 0 0 1 3 3.5h2L6 2Zm2 3.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm0 1.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Z" />
          </svg>
          Take a photo instead
        </label>
        <input
          id={`${inputId}-camera`}
          type="file"
          className="sr-only"
          accept="image/*"
          capture="environment"
          disabled={full}
          onChange={(e) => {
            if (e.target.files) void accept(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      {value.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-1">
          {value.map((f) => (
            <li
              key={f.id}
              className={cn(
                'flex items-center gap-1.5 rounded-card border p-1',
                f.status === 'error' ? 'border-critical-lo bg-critical-lo' : 'border-line bg-surface',
              )}
            >
              <Thumb file={f} />

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="truncate text-small font-medium text-ink">{f.file.name}</p>
                <p className="text-small text-ink-soft">
                  {f.status === 'error' ? (
                    <span className="text-critical">{f.error}</span>
                  ) : f.status === 'compressing' ? (
                    'Preparing'
                  ) : f.status === 'uploading' ? (
                    `Uploading ${f.progress}%`
                  ) : (
                    formatBytes(f.file.size)
                  )}
                </p>

                {f.status === 'uploading' ? (
                  <div
                    className="h-0.5 w-full overflow-hidden rounded-pill bg-midnight-lo"
                    role="progressbar"
                    aria-valuenow={f.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Uploading ${f.file.name}`}
                  >
                    <div
                      className="h-full bg-ink transition-[width] duration-(--dur-state) ease-state"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => remove(f.id)}
                aria-label={`Remove ${f.file.name}`}
                className="tap-target shrink-0 rounded-pill p-0.5 text-ink-soft transition-colors duration-(--dur-state) ease-state hover:bg-midnight-lo hover:text-critical"
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
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}

/** HEIC and PDF cannot be drawn by the browser, so they get a labelled chip. */
function Thumb({ file }: { file: UploadedFile }) {
  if (file.previewUrl) {
    return (
      <img
        src={file.previewUrl}
        alt=""
        width={48}
        height={48}
        className="size-6 shrink-0 rounded-control object-cover"
      />
    );
  }
  const kind = isPdf(file.file) ? 'PDF' : isHeic(file.file) ? 'HEIC' : 'FILE';
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-control bg-midnight-lo text-small font-medium text-ink"
      aria-hidden="true"
    >
      {kind}
    </span>
  );
}
