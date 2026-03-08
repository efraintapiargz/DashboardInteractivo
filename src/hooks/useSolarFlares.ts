import { useState, useEffect, useCallback, useRef } from 'react';
import type { DonkiFlareResponse, ApiError } from '@/types';
import { fetchSolarFlares } from '@/services/nasaApi';
import { parseApiError } from '@/utils/errorHandler';

interface UseSolarFlaresResult {
  data: DonkiFlareResponse[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useSolarFlares(
  startDate: string,
  endDate: string,
): UseSolarFlaresResult {
  const [data, setData] = useState<DonkiFlareResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetch = useCallback(() => {
    setFetchKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setError(null);

    fetchSolarFlares(startDate, endDate, controller.signal)
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
              : parseApiError(err, '/DONKI/FLR');
          setError(apiError);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [startDate, endDate, fetchKey]);

  return { data, isLoading, error, refetch };
}
