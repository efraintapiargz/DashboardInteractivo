import type { ApodResponse, NeoFeedResponse, DonkiFlareResponse } from '@/types';
import { parseApiError } from '@/utils/errorHandler';
import { apiCache } from '@/utils/apiCache';
import { NASA_API_BASE_URL, NASA_ENDPOINTS, NASA_API_KEY } from '@/services/constants';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

// Tracks in-flight requests to avoid duplicate calls for the same URL
const inflightRequests = new Map<string, Promise<unknown>>();

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { signal });

      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : BASE_DELAY_MS * Math.pow(2, attempt);
          await wait(delayMs);
          continue;
        }
      }

      if (!response.ok) throw response;

      return await response.json() as T;
    } catch (error: unknown) {
      lastError = error;
      if (signal?.aborted) throw error;
      if (error instanceof Response && error.status !== 429) throw error;
      if (attempt === MAX_RETRIES) break;
    }
  }

  throw lastError;
}

async function fetchFromNasa<T>(
  endpoint: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const url = buildUrl(endpoint, params);

  const cached = apiCache.get<T>(url);
  if (cached !== undefined) return cached;

  // Deduplicate: reuse in-flight request for the same URL
  const inflight = inflightRequests.get(url) as Promise<T> | undefined;
  if (inflight) return inflight;

  const request = fetchWithRetry<T>(url, signal)
    .then((data) => {
      apiCache.set(url, data);
      return data;
    })
    .catch((error: unknown) => {
      if (error instanceof Response) throw parseApiError(error, endpoint);
      throw parseApiError(error, endpoint);
    })
    .finally(() => {
      inflightRequests.delete(url);
    });

  inflightRequests.set(url, request);
  return request;
}

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
