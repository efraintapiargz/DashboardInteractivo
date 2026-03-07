import { apiCache } from '@/utils/apiCache';

describe('apiCache', () => {
  beforeEach(() => {
    apiCache.clear();
  });

  it('returns undefined for a missing key', () => {
    expect(apiCache.get('missing')).toBeUndefined();
  });

  it('stores and retrieves a value', () => {
    apiCache.set('key1', { data: 42 });
    expect(apiCache.get('key1')).toEqual({ data: 42 });
  });

  it('reports correct size', () => {
    expect(apiCache.size).toBe(0);
    apiCache.set('a', 1);
    apiCache.set('b', 2);
    expect(apiCache.size).toBe(2);
  });

  it('deletes a specific key', () => {
    apiCache.set('key', 'value');
    apiCache.delete('key');
    expect(apiCache.get('key')).toBeUndefined();
  });

  it('clears all entries', () => {
    apiCache.set('a', 1);
    apiCache.set('b', 2);
    apiCache.clear();
    expect(apiCache.size).toBe(0);
  });
});
