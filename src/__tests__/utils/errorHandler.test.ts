import { parseApiError } from '@/utils/errorHandler';

describe('parseApiError', () => {
  it('handles AbortError (DOMException)', () => {
    const error = new DOMException('The operation was aborted.', 'AbortError');
    const result = parseApiError(error, '/apod');

    expect(result.message).toBe('Request was cancelled');
    expect(result.statusCode).toBeNull();
    expect(result.endpoint).toBe('/apod');
    expect(result.timestamp).toBeDefined();
  });

  it('handles TypeError "Failed to fetch" as a network error', () => {
    const error = new TypeError('Failed to fetch');
    const result = parseApiError(error, '/neo/feed');

    expect(result.message).toBe('Network error: Unable to reach the server');
    expect(result.statusCode).toBeNull();
    expect(result.endpoint).toBe('/neo/feed');
  });

  it('handles a Response object when available', () => {
    // Response may not exist in all test environments (jsdom).
    // When present, parseApiError should extract status info.
    if (typeof globalThis.Response !== 'undefined') {
      const response = new Response(null, { status: 404, statusText: 'Not Found' });
      const result = parseApiError(response, '/apod');

      expect(result.message).toBe('HTTP 404: Not Found');
      expect(result.statusCode).toBe(404);
      expect(result.endpoint).toBe('/apod');
    }
  });

  it('handles a generic Error', () => {
    // To avoid hitting the Response instanceof check (which may throw
    // in environments lacking the global), ensure parseApiError can reach
    // the Error branch by passing an ordinary Error.
    const error = new Error('Something broke');
    const result = parseApiError(error, '/donki');

    expect(result.message).toBe('Something broke');
    expect(result.statusCode).toBeNull();
  });

  it('handles a string error', () => {
    const result = parseApiError('string error', '/test');

    expect(result.message).toBe('string error');
    expect(result.statusCode).toBeNull();
    expect(result.endpoint).toBe('/test');
  });

  it('handles an unknown error type', () => {
    const result = parseApiError(12345, '/test');

    expect(result.message).toBe('An unknown error occurred');
    expect(result.statusCode).toBeNull();
  });

  it('uses default endpoint when not provided', () => {
    const result = parseApiError(null);
    expect(result.endpoint).toBe('unknown');
  });
});
