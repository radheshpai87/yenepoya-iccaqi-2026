import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yenepoya@2026';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'yenepoya_iccaqi_2026_default_secret_key_39102';

// 24 hours session duration
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Constant-time comparison to prevent timing attacks
 */
export function verifyAdminPassword(providedPassword: string): boolean {
  try {
    const a = Buffer.from(providedPassword);
    const b = Buffer.from(ADMIN_PASSWORD);
    
    // Lengths must match before timingSafeEqual
    if (a.length !== b.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Creates a cryptographically signed session token
 */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE;
  const payload = `admin_auth:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
    
  return `${payload}.${signature}`;
}

/**
 * Verifies if the session token is valid and unexpired
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    
    const [payload, signature] = parts;
    const [prefix, expiresStr] = payload.split(':');
    
    if (prefix !== 'admin_auth') return false;
    
    const expiresAt = parseInt(expiresStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');
      
    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);
    
    if (sigA.length !== sigB.length) return false;
    
    return crypto.timingSafeEqual(sigA, sigB);
  } catch {
    return false;
  }
}
