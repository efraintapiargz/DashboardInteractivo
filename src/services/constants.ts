/** NASA API base URL */
export const NASA_API_BASE_URL = 'https://api.nasa.gov';

/** NASA API endpoints */
export const NASA_ENDPOINTS = {
  APOD: '/planetary/apod',
  NEO_FEED: '/neo/rest/v1/feed',
  DONKI_FLR: '/DONKI/FLR',
} as const;

/** API key from environment or fallback to DEMO_KEY */
export const NASA_API_KEY =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_NASA_API_KEY : undefined) ??
  'DEMO_KEY';
