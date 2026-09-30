/**
 * Simple sliding-window rate limiter for server API routes
 */
const ipStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // Max 5 requests per minute per IP

export function checkRateLimit(ip: string): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const record = ipStore.get(ip);

  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { success: false, limit: MAX_REQUESTS, remaining: 0 };
  }

  record.count += 1;
  return { success: true, limit: MAX_REQUESTS, remaining: MAX_REQUESTS - record.count };
}
