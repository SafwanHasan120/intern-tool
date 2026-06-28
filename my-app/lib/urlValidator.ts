// URL validation with caching
import { fetchWithRetry } from './retryManager';
import { rateLimitedFetch } from './rateLimiter';

export type LinkHealth = 'healthy' | 'not-found' | 'server-error' | 'timeout' | 'unknown';

interface LinkValidationResult {
  url: string;
  status: number | null;
  health: LinkHealth;
  checkedAt: number; // epoch ms
  cacheHit: boolean;
}

interface CachedLink {
  status: number | null;
  health: LinkHealth;
  checkedAt: number;
}

// In-memory cache for link validation (in production, consider file-based or Redis)
const linkCache = new Map<string, CachedLink>();

// Expire cache entries after 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function validateUrl(url: string): Promise<LinkValidationResult> {
  if (!url || !url.startsWith('http')) {
    return { url, status: null, health: 'unknown', checkedAt: Date.now(), cacheHit: false };
  }

  // Check cache
  const cached = linkCache.get(url);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return {
      url,
      status: cached.status,
      health: cached.health,
      checkedAt: cached.checkedAt,
      cacheHit: true,
    };
  }

  try {
    const result = await rateLimitedFetch(url, () =>
      fetchWithRetry(url, {
        method: 'HEAD',
        maxRetries: 2,
        timeoutMs: 5000,
      })
    );

    const status = result.status;
    let health: LinkHealth = 'unknown';

    if (status >= 200 && status < 300) {
      health = 'healthy';
    } else if (status === 404) {
      health = 'not-found';
    } else if (status >= 500) {
      health = 'server-error';
    }

    const validationResult: CachedLink = {
      status,
      health,
      checkedAt: Date.now(),
    };

    linkCache.set(url, validationResult);

    return {
      url,
      status,
      health,
      checkedAt: validationResult.checkedAt,
      cacheHit: false,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const health: LinkHealth = msg.includes('timeout') ? 'timeout' : 'unknown';

    const validationResult: CachedLink = {
      status: null,
      health,
      checkedAt: Date.now(),
    };

    linkCache.set(url, validationResult);

    return {
      url,
      status: null,
      health,
      checkedAt: validationResult.checkedAt,
      cacheHit: false,
    };
  }
}

export async function validateUrls(urls: string[]): Promise<LinkValidationResult[]> {
  return Promise.allSettled(urls.map(validateUrl)).then((results) =>
    results.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            url: 'unknown',
            status: null,
            health: 'unknown' as const,
            checkedAt: Date.now(),
            cacheHit: false,
          }
    )
  );
}

export function clearUrlCache(): void {
  linkCache.clear();
}

export function getCacheStats() {
  return {
    cachedUrls: linkCache.size,
    entries: Array.from(linkCache.entries()).map(([url, cached]) => ({
      url,
      health: cached.health,
      status: cached.status,
      age: Date.now() - cached.checkedAt,
    })),
  };
}
