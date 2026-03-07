interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Simple in-memory cache with TTL for API responses.
 * Keys are URL strings; values are the parsed JSON payloads.
 */
class ApiCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private ttl: number;

  constructor(ttlMs: number = DEFAULT_TTL_MS) {
    this.ttl = ttlMs;
  }

  /** Retrieve a cached value. Returns `undefined` if missing or expired. */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /** Store a value with the current timestamp. */
  set<T>(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  /** Remove a specific key. */
  delete(key: string): void {
    this.store.delete(key);
  }

  /** Clear all cached data. */
  clear(): void {
    this.store.clear();
  }

  /** Number of entries currently stored. */
  get size(): number {
    return this.store.size;
  }
}

/** Singleton cache instance shared across the application */
export const apiCache = new ApiCache();
