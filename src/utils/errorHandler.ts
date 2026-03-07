import type { ApiError } from '@/types';

const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred';
const NETWORK_ERROR_MESSAGE = 'Network error: Unable to reach the server';
const ABORT_ERROR_MESSAGE = 'Request was cancelled';

/**
 * Parses an unknown error into a standardized ApiError object
 */
export function parseApiError(error: unknown, endpoint = 'unknown'): ApiError {
  const timestamp = new Date().toISOString();

  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      message: ABORT_ERROR_MESSAGE,
      statusCode: null,
      endpoint,
      timestamp,
    };
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      message: NETWORK_ERROR_MESSAGE,
      statusCode: null,
      endpoint,
      timestamp,
    };
  }

  if (
    typeof Response !== 'undefined' &&
    error instanceof Response
  ) {
    return {
      message: `HTTP ${error.status}: ${error.statusText}`,
      statusCode: error.status,
      endpoint,
      timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: null,
      endpoint,
      timestamp,
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      statusCode: null,
      endpoint,
      timestamp,
    };
  }

  return {
    message: UNKNOWN_ERROR_MESSAGE,
    statusCode: null,
    endpoint,
    timestamp,
  };
}
