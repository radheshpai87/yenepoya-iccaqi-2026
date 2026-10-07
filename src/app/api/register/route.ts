import { validateRequestId, requestHash, throwSaveError } from '@/lib/idempotency';
import { ApiError, apiErrorResponse, readJsonObject } from '@/lib/apiErrors';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    // 1. IP Rate Limiting Check (Generous 30 req/min for shared university campus networks)
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await readJsonObject(request);
    const requestId = validateRequestId(body.requestId);
    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 254);
    const phone = sanitizeText(body.phone, 30);
    const institution = sanitizeText(body.institution, 200);
    const category = sanitizeText(body.category, 100);
    const currency = sanitizeText(body.currency, 10);
    const amount = sanitizeText(body.amount, 20);
    const mode = sanitizeText(body.mode, 100);
    const paperId = sanitizeText(body.paperId, 50);
    const paperTitle = sanitizeText(body.paperTitle, 300);

    if (!name || !email || !institution || !category) {
      return NextResponse.json(
        { error: 'Required registration fields missing' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    const regRecord = {
      name,
      email,
      phone: phone || '',
      institution,
      category,
      currency: currency || 'INR',
      amount: amount || '₹500',
      mode: mode || 'In-Person',
      paper_id: paperId || '',
      paper_title: paperTitle || '',
      payment_status: 'Pending',
    };

    if (!isSupabaseConfigured()) {
      throw new ApiError(503, 'Saving is temporarily unavailable. Please try again later.');
    }
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin.rpc('save_registration', {
      p_request_id: requestId,
      p_request_hash: requestHash(regRecord),
      p_registration: { ...regRecord, created_at: new Date().toISOString() },
    });
    if (error || !data?.id) throwSaveError(error);

    return NextResponse.json({
      success: true,
      registration: data,
      supabaseSaved: true,
      message: 'Registration successfully saved in Supabase database',
    });
  } catch (err) {
    return apiErrorResponse(err, 'register request failed:');
  }
}
