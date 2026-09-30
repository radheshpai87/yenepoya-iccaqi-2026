/**
 * Sliding-window rate limiter for server API routes
 * Optimized for international conferences where multiple delegates
 * may share a single public IP address (e.g. University Wi-Fi, NAT networks, Cloudflare)
 */
const ipStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_MIN = 30; // Generous threshold (30 requests/min/IP) for shared university campus networks

export function checkRateLimit(ip: string, customLimit?: number): { success: boolean; limit: number; remaining: number } {
  const now = Date.now();
  const limit = customLimit || MAX_REQUESTS_PER_MIN;
  const record = ipStore.get(ip);

  if (!record || now > record.resetTime) {
    ipStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { success: true, limit, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, limit, remaining: 0 };
  }

  record.count += 1;
  return { success: true, limit, remaining: limit - record.count };
}

/**
 * Extracts true client IP address supporting Cloudflare, Vercel, and proxy headers
 */
export function getClientIP(request: Request): string {
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();

  return '127.0.0.1';
}
