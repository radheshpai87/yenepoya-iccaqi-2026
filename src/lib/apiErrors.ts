import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, 'Request body must contain valid JSON');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be a JSON object');
  }
  return body as Record<string, unknown>;
}

export async function readFormData(request: Request): Promise<FormData> {
  try {
    return await request.formData();
  } catch {
    throw new ApiError(400, 'Request body must contain valid multipart form data');
  }
}

export function apiErrorResponse(error: unknown, context: string) {
  if (error instanceof ApiError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  console.error(context, error);
  return NextResponse.json(
    { success: false, error: 'Unable to confirm your save. Please retry with the same details.' },
    { status: 503 },
  );
}
