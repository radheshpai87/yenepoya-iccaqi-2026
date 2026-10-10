import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText } from '@/lib/validation';
import { ApiError, apiErrorResponse } from '@/lib/apiErrors';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const registrationId = sanitizeText(formData.get('registrationId'), 100);
    const paperId = sanitizeText(formData.get('paperId'), 100);
    const name = sanitizeText(formData.get('name'), 100);
    const email = sanitizeText(formData.get('email'), 254);
    const phone = sanitizeText(formData.get('phone'), 30);
    const institution = sanitizeText(formData.get('institution'), 200);
    const category = sanitizeText(formData.get('category'), 100);
    const currency = sanitizeText(formData.get('currency'), 10);
    const amount = sanitizeText(formData.get('amount'), 20);
    const mode = sanitizeText(formData.get('mode'), 100);
    const paperTitle = sanitizeText(formData.get('paperTitle'), 300);
    const transactionRef = sanitizeText(formData.get('transactionRef'), 100);
    const fileValue = formData.get('file');
    const file = fileValue instanceof File ? fileValue : null;

    if (!registrationId && !paperId) {
      return NextResponse.json(
        { error: 'Registration ID or Paper ID parameter is required' },
        { status: 400 }
      );
    }

    if (!name || !email || !institution || !category || !amount || !currency || !isValidEmail(email)) {
      throw new ApiError(400, 'Valid name, email, institution, category, and payment amount are required');
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'Payment receipt screenshot file is required' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) throw new ApiError(400, 'Payment receipt must be 10 MB or smaller');
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedTypes: Record<string, string[]> = {
      jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'], pdf: ['application/pdf'],
    };
    if (!allowedTypes[fileExtension] || (file.type && !allowedTypes[fileExtension].includes(file.type))) {
      throw new ApiError(400, 'Payment receipt must be a JPG, PNG, WEBP, or PDF file');
    }

    // 2. Validate Screenshot File
    if (!isSupabaseConfigured()) throw new ApiError(503, 'Payment proof saving is temporarily unavailable. Please try again later.');
    const supabaseAdmin = getSupabaseAdminClient();
    const safeRef = transactionRef || '';
    const filePath = `${randomUUID()}.${fileExtension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || (fileExtension === 'pdf' ? 'application/pdf' : fileExtension === 'png' ? 'image/png' : fileExtension === 'webp' ? 'image/webp' : 'image/jpeg');
    const { data: uploadedFile, error: uploadError } = await supabaseAdmin.storage
      .from('payment-receipts')
      .upload(filePath, buffer, { contentType, upsert: false });

    if (uploadError || !uploadedFile) {
      console.error('Payment receipt upload failed:', uploadError);
      throw new ApiError(503, 'Receipt upload could not be confirmed. Please try again.');
    }

    const { data: savedProof, error: saveError } = await supabaseAdmin
      .from('payment_proofs')
      .insert({
        registration_id: registrationId || null,
        paper_id: paperId || null,
        name, email, phone, institution, category, currency, amount, mode, paper_title: paperTitle,
        transaction_ref: safeRef,
        file_path: uploadedFile.path,
        file_name: file.name.slice(0, 255),
        content_type: contentType,
        file_size: file.size,
        status: 'Pending Verification',
      })
      .select('id, created_at')
      .single();

    if (saveError || !savedProof) {
      await supabaseAdmin.storage.from('payment-receipts').remove([uploadedFile.path]);
      console.error('Payment proof record save failed:', saveError);
      throw new ApiError(503, 'Payment details could not be saved. Please retry your submission.');
    }

    const targetRegistration = registrationId
      ? await supabaseAdmin.from('registrations').select('id').eq('id', registrationId).maybeSingle()
      : paperId
        ? await supabaseAdmin.from('registrations').select('id').eq('paper_id', paperId).maybeSingle()
        : null;
    if (targetRegistration?.data?.id) {
      await supabaseAdmin.from('registrations').update({ payment_status: 'Pending Verification' }).eq('id', targetRegistration.data.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment proof screenshot successfully uploaded and submitted for administrator verification.',
      proofId: savedProof.id,
      proofUrl: '',
      transactionRef: safeRef,
    });
  } catch (err) {
    return apiErrorResponse(err, 'payment proof upload failed:');
  }
}
