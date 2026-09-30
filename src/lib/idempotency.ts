/**
 * Server-side Idempotency Cache to prevent duplicate submissions on double-clicks
 */

interface IdempotentRecord {
  result: any;
  timestamp: number;
}

const idempotencyCache = new Map<string, IdempotentRecord>();

// Cache TTL: 5 minutes (300,000 ms)
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getIdempotentResponse(requestId: string): any | null {
  if (!requestId) return null;

  const record = idempotencyCache.get(requestId);
  if (!record) return null;

  // Check if record is still valid within 5-minute TTL
  if (Date.now() - record.timestamp < CACHE_TTL_MS) {
    return record.result;
  }

  // Expired record
  idempotencyCache.delete(requestId);
  return null;
}

export function setIdempotentResponse(requestId: string, result: any): void {
  if (!requestId) return;

  // Garbage collect expired entries if cache grows
  if (idempotencyCache.size > 500) {
    const now = Date.now();
    for (const [key, value] of idempotencyCache.entries()) {
      if (now - value.timestamp >= CACHE_TTL_MS) {
        idempotencyCache.delete(key);
      }
    }
  }

  idempotencyCache.set(requestId, {
    result,
    timestamp: Date.now(),
  });
}
