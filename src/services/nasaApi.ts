import type { ApodResponse, NeoFeedResponse, DonkiFlareResponse } from '@/types';
import { parseApiError } from '@/utils/errorHandler';
import { apiCache } from '@/utils/apiCache';
import { NASA_API_BASE_URL, NASA_ENDPOINTS, NASA_API_KEY } from '@/services/constants';

/**
 * Builds a URL with query parameters for NASA API requests
 */
function buildUrl(endpoint: string, params: Record<string, string>): string {
  const url = new URL(`${NASA_API_BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', NASA_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

/**
 * Generic fetch wrapper with error handling, caching, and typed responses
 */
async function fetchFromNasa<T>(
  endpoint: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = buildUrl(endpoint, params);

  // Check cache first
  const cached = apiCache.get<T>(url);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw response;
    }

    const data: T = await response.json();
    apiCache.set(url, data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw parseApiError(error, endpoint);
    }
    throw parseApiError(error, endpoint);
  }
}

/**
 * Fetches the Astronomy Picture of the Day
 * @param date - Optional date in YYYY-MM-DD format
 * @param signal - Optional AbortSignal for cancellation
 */
export async function fetchApod(
  date?: string,
  signal?: AbortSignal,
): Promise<ApodResponse> {
  const params: Record<string, string> = {};
  if (date) {
    params.date = date;
  }
  return fetchFromNasa<ApodResponse>(NASA_ENDPOINTS.APOD, params, signal);
}

/**
 * Fetches Near Earth Objects for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format (max 7 days from start)
 * @param signal - Optional AbortSignal for cancellation
 */
export async function fetchNeoFeed(
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<NeoFeedResponse> {
  return fetchFromNasa<NeoFeedResponse>(
    NASA_ENDPOINTS.NEO_FEED,
    { start_date: startDate, end_date: endDate },
    signal,
  );
}

/**
 * Fetches Solar Flare events from DONKI
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param signal - Optional AbortSignal for cancellation
 */
export async function fetchSolarFlares(
  startDate: string,
  endDate: string,
  signal?: AbortSignal,
): Promise<DonkiFlareResponse[]> {
  return fetchFromNasa<DonkiFlareResponse[]>(
    NASA_ENDPOINTS.DONKI_FLR,
    { startDate, endDate },
    signal,
  );
}
