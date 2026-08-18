const DEFAULT_REQUEST_LIMIT = 5;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_KEYS = 100;

interface RateLimitRecord {
  count: number;
  lastRequest: number;
}

export interface RateLimiterOptions {
  maxKeys: number;
  maxRequests: number;
  now: () => number;
  windowMs: number;
}

export interface RateLimiter {
  isRateLimited(key: string): boolean;
  recordFailure(key: string): void;
}

class InMemoryRateLimiter implements RateLimiter {
  private recordMap = new Map<string, RateLimitRecord>();
  private maxKeys: number;
  private maxRequests: number;
  private now: () => number;
  private windowMs: number;
  private requests = 0;

  constructor(options?: Partial<RateLimiterOptions>) {
    this.maxRequests = options?.maxRequests ?? DEFAULT_REQUEST_LIMIT;
    this.windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
    this.maxKeys = options?.maxKeys ?? DEFAULT_MAX_KEYS;
    this.now = options?.now ?? Date.now;

    if (this.maxRequests < 1 || this.windowMs < 1 || this.maxKeys < 1) {
      throw new TypeError("Rate limiter options must be positive.");
    }
  }

  public isRateLimited(key: string): boolean {
    const now = this.now();
    const record = this.recordMap.get(key);

    if (!record) {
      return false;
    }

    if (now - record.lastRequest >= this.windowMs) {
      this.recordMap.delete(key);
      return false;
    }

    return record.count >= this.maxRequests;
  }

  public recordFailure(key: string): void {
    const now = this.now();

    this.requests += 1;

    if (this.requests >= 100) {
      this.cleanup(now);
      this.requests = 0;
    }

    const record = this.recordMap.get(key) || { count: 0, lastRequest: now };

    if (now - record.lastRequest >= this.windowMs) {
      record.count = 0;
      record.lastRequest = now;
    }

    record.count += 1;

    // Refresh insertion order so the oldest entry is the least recently used.
    this.recordMap.delete(key);
    this.recordMap.set(key, record);
    this.enforceCapacity();
  }

  private cleanup(now: number): void {
    for (const [key, record] of this.recordMap) {
      if (now - record.lastRequest >= this.windowMs) {
        this.recordMap.delete(key);
      }
    }
  }

  private enforceCapacity(): void {
    while (this.recordMap.size > this.maxKeys) {
      const oldestKey = this.recordMap.keys().next().value;

      if (oldestKey === undefined) {
        return;
      }

      this.recordMap.delete(oldestKey);
    }
  }
}

export function createRateLimiter(
  options: Partial<RateLimiterOptions> = {},
) {
  return new InMemoryRateLimiter(options);
}
