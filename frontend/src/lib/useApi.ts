import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiResponse } from '@shared/types/index.js';
import { ApiError } from './api.js';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  /** Re-runs the request. Bound to the retry control in error states. */
  reload: () => void;
}

/**
 * Runs an API read and tracks loading and error state.
 *
 * `deps` decides when to re-run, the same contract as useEffect. The result of
 * a stale request is discarded rather than applied, so a fast second call
 * cannot be overwritten by a slow first one - which is exactly what happens
 * when someone types three pincodes quickly.
 */
export function useApi<T>(fetcher: () => Promise<ApiResponse<T>>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  const run = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const id = ++run.current;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((res) => {
        if (id !== run.current) return;
        setData(res.data);
      })
      .catch((err: unknown) => {
        if (id !== run.current) return;
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(
                'unexpected_error',
                'Something went wrong at our end. Try again in a moment.',
              ),
        );
      })
      .finally(() => {
        if (id === run.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}

/**
 * Runs an API write on demand and tracks the in-flight and error state.
 * Separate from useApi because a submission must never fire on render.
 */
export function useSubmit<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<ApiResponse<TResult>>,
) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const submit = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setSubmitting(true);
      setError(null);
      try {
        const res = await action(...args);
        return res.data;
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err
            : new ApiError(
                'unexpected_error',
                'We could not send that. Your details are still here - try again.',
              ),
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [action],
  );

  return { submit, submitting, error, clearError: () => setError(null) };
}
