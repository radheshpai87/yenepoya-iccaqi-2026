export interface RequestAttempt {
  payload: string;
  requestId: string;
}

export function requestAttempt(previous: RequestAttempt | null, payload: string): RequestAttempt {
  if (previous?.payload === payload) return previous;
  // randomUUID needs a secure context; getRandomValues also supports older browsers.
  let requestId: string;
  if (typeof crypto.randomUUID === 'function') {
    requestId = crypto.randomUUID();
  } else {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    requestId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return { payload, requestId };
}
