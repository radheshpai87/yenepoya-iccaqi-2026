import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ApiError } from '@/lib/apiErrors';

export function validateRequestId(value: unknown): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(400, 'A valid UUID requestId is required for safe retries');
  }
  return value.toLowerCase();
}

// Hash normalized business fields, excluding generated IDs/timestamps/URLs.
// Manuscript bytes participate in the hash, so a key cannot replay another file.
export function requestHash(fields: Record<string, unknown>, file?: Buffer): string {
  const hash = createHash('sha256').update(JSON.stringify(fields));
  if (file) hash.update(file);
  return hash.digest('hex');
}

export async function getSavedResponse(
  client: SupabaseClient,
  operation: 'registration' | 'submission',
  requestId: string,
  hash: string,
): Promise<Record<string, unknown> | null> {
  const { data, error } = await client.from('api_requests')
    .select('request_hash,response')
    .eq('operation', operation)
    .eq('request_id', requestId)
    .maybeSingle();
  if (error) {
    console.error('Persistent retry lookup failed:', error);
    throw new ApiError(503, 'Saving is temporarily unavailable. Please retry with the same details.');
  }
  if (!data) return null;
  if (data.request_hash !== hash) {
    throw new ApiError(409, 'This retry contains different details or a different file. Please start a new submission.');
  }
  return data.response;
}

export function throwSaveError(error: { message: string } | null): never {
  if (error?.message === 'IDEMPOTENCY_CONFLICT') {
    throw new ApiError(409, 'This retry contains different details or a different file. Please start a new submission.');
  }
  console.error('Durable save failed:', error);
  throw new ApiError(503, 'Unable to confirm your save. Please retry with the same details.');
}
