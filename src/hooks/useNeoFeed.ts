import { useState, useEffect, useCallback, useRef } from 'react';
import type { NeoFeedResponse, NeoObject, ApiError } from '@/types';
import { fetchNeoFeed } from '@/services/nasaApi';
import { parseApiError } from '@/utils/errorHandler';

interface NeoStats {
  totalCount: number;
  hazardousCount: number;
  nonHazardousCount: number;
  averageDiameterKm: number;
}

interface UseNeoFeedResult {
  data: NeoFeedResponse | null;
  neoList: NeoObject[];
  stats: NeoStats;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

const EMPTY_STATS: NeoStats = {
  totalCount: 0,
  hazardousCount: 0,
  nonHazardousCount: 0,
  averageDiameterKm: 0,
};

/**
 * Flattens NEO feed response into a single list of NeoObjects
 */
function flattenNeoObjects(
  response: NeoFeedResponse,
): NeoObject[] {
  return Object.values(response.near_earth_objects).flat();
}

/**
 * Computes statistics from a list of NeoObjects
 */
function computeNeoStats(neoList: NeoObject[]): NeoStats {
  if (neoList.length === 0) return EMPTY_STATS;

  const hazardousCount = neoList.filter(
    (neo) => neo.is_potentially_hazardous_asteroid,
  ).length;

  const totalDiameter = neoList.reduce((sum, neo) => {
    const diameter = neo.estimated_diameter.kilometers;
    return sum + (diameter.estimated_diameter_min + diameter.estimated_diameter_max) / 2;
  }, 0);

  return {
    totalCount: neoList.length,
    hazardousCount,
    nonHazardousCount: neoList.length - hazardousCount,
    averageDiameterKm: totalDiameter / neoList.length,
  };
}

/**
 * Hook to fetch Near Earth Objects for a date range.
 * Returns parsed list + stats. Cleans up on unmount.
 */
export function useNeoFeed(
  startDate: string,
  endDate: string,
): UseNeoFeedResult {
  const [data, setData] = useState<NeoFeedResponse | null>(null);
  const [neoList, setNeoList] = useState<NeoObject[]>([]);
  const [stats, setStats] = useState<NeoStats>(EMPTY_STATS);
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

    fetchNeoFeed(startDate, endDate, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          const list = flattenNeoObjects(result);
          setNeoList(list);
          setStats(computeNeoStats(list));
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          const apiError =
            typeof err === 'object' && err !== null && 'message' in err
              ? (err as ApiError)
              : parseApiError(err, '/neo/rest/v1/feed');
          setError(apiError);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [startDate, endDate, fetchKey]);

  return { data, neoList, stats, isLoading, error, refetch };
}
