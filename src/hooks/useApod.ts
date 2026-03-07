import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApodResponse, ApiError } from '@/types';
import { fetchApod } from '@/services/nasaApi';
import { parseApiError } from '@/utils/errorHandler';

interface UseApodResult {
  data: ApodResponse | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

/**
 * Hook to fetch the Astronomy Picture of the Day.
 * Automatically cleans up on unmount using AbortController.
 */
export function useApod(date?: string): UseApodResult {
  const [data, setData] = useState<ApodResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setError(null);

    fetchApod(date, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          const apiError =
            typeof err === 'object' && err !== null && 'message' in err
              ? (err as ApiError)
              : parseApiError(err, '/planetary/apod');
          setError(apiError);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [date, fetchKey]);

  return { data, isLoading, error, refetch };
}
