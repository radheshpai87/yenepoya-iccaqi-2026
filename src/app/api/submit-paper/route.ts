import { randomUUID } from 'node:crypto';
import { ApiError, apiErrorResponse, readFormData } from '@/lib/apiErrors';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText, validateUploadedFile, validateFileMagicBytes } from '@/lib/validation';
import { validateRequestId, requestHash, getSavedResponse, throwSaveError } from '@/lib/idempotency';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting Check (Generous 30 req/min for shared university campus networks)
    const ip = getClientIP(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many paper submissions from your network. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const formData = await readFormData(request);
    
    const requestId = validateRequestId(formData.get('requestId'));

    const authorName = sanitizeText(formData.get('authorName') as string, 100);
    const email = sanitizeText(formData.get('email') as string, 254);
    const phone = sanitizeText(formData.get('phone') as string, 30);
    const institution = sanitizeText(formData.get('institution') as string, 200);
    const authorCategory = sanitizeText(formData.get('authorCategory') as string, 100) || 'Research Scholars / Academicians';
    const publicationCategory = sanitizeText(formData.get('publicationCategory') as string, 150) || 'Category 1: Peer-Reviewed Journals';
    const track = sanitizeText(formData.get('track') as string, 150);
    const paperTitle = sanitizeText(formData.get('paperTitle') as string, 300);
    const abstract = sanitizeText(formData.get('abstract') as string, 5000);
    const mode = sanitizeText(formData.get('mode') as string, 100);
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'A nonempty manuscript file is required' }, { status: 400 });
    }

    if (!authorName || !email || !paperTitle || !abstract || !track) {
      return NextResponse.json(
        { error: 'Required manuscript submission fields missing' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid author email address format' },
        { status: 400 }
      );
    }

    // 3. Strict File Size & Format Validation
    if (file) {
      const fileValidation = validateUploadedFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { error: fileValidation.error || 'Invalid document file' },
          { status: 400 }
        );
      }

      // 4. Binary Magic Byte Signature Inspection (Prevents extension spoofing)
      const magicCheck = await validateFileMagicBytes(file);
      if (!magicCheck.valid) {
        return NextResponse.json(
          { error: magicCheck.error || 'Corrupted document binary signature' },
          { status: 400 }
        );
      }
    }

    if (!isSupabaseConfigured()) {
      throw new ApiError(503, 'Saving is temporarily unavailable. Please try again later.');
    }
    const supabaseAdmin = getSupabaseAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = requestHash({
      authorName, email, phone, institution, authorCategory, publicationCategory,
      track, paperTitle, abstract, mode: mode || 'Hybrid',
      fileName: file.name, fileType: file.type,
    }, buffer);
    const previous = await getSavedResponse(supabaseAdmin, 'submission', requestId, hash);
    if (previous) return submissionResponse(previous);
    const submissionId = `ICCAQI-2026-${randomUUID()}`;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `${submissionId}_${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError || !uploadData) {
      console.error('Manuscript storage save failed:', uploadError);
      throw new ApiError(503, 'Manuscript upload could not be confirmed. Please retry with the same file.');
    }
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('manuscripts')
      .getPublicUrl(uploadData.path);
    const fileUrl = publicUrlData.publicUrl;

    const createdAt = new Date().toISOString();

    const categoryFeeMap: Record<string, string> = {
      'Students (UG / PG)': '₹500',
      'Research Scholars / Academicians': '₹750',
      'Industry Delegates': '₹1,500',
    };
    const feeAmount = categoryFeeMap[authorCategory] || '₹750';

    const submissionRecord = {
      submission_id: submissionId,
      author_name: authorName,
      email,
      phone: phone || '',
      institution,
      author_category: authorCategory,
      publication_category: publicationCategory,
      track,
      paper_title: paperTitle,
      abstract,
      participation_mode: mode || 'Hybrid',
      file_url: fileUrl,
      review_status: 'Submitted',
      created_at: createdAt,
    };

    const regRecord = {
      name: authorName,
      email,
      phone: phone || '',
      institution,
      category: authorCategory || 'Research Scholars / Academicians',
      currency: 'INR',
      amount: feeAmount,
      mode: mode || 'Hybrid',
      paper_id: submissionId,
      paper_title: paperTitle,
      payment_status: 'Pending',
      created_at: createdAt,
    };

    const { data: savedData, error: saveError } = await supabaseAdmin.rpc('save_paper_submission', {
      p_request_id: requestId,
      p_request_hash: hash,
      p_submission: submissionRecord,
      p_registration: regRecord,
    });
    if (saveError || typeof savedData?.id !== 'string' || typeof savedData?.submission_id !== 'string' || typeof savedData?.file_url !== 'string') {
      // Preserve the file on ambiguous failures: the transaction may be committed.
      // A retry with the same key recovers the saved response from PostgreSQL.
      throwSaveError(saveError);
    }
    if (savedData.file_url !== fileUrl) {
      // A concurrent identical request already committed its own manuscript.
      // Only remove this attempt's extra file, never the winning file.
      try {
        const { error } = await supabaseAdmin.storage.from('manuscripts').remove([uploadData.path]);
        if (error) console.warn('Redundant upload cleanup failed:', error);
      } catch (error) {
        console.warn('Redundant upload cleanup failed:', error);
      }
    }
    return submissionResponse(savedData);
  } catch (err) {
    return apiErrorResponse(err, 'submit-paper request failed:');
  }
}

function submissionResponse(savedData: Record<string, unknown>) {
  if (typeof savedData.id !== 'string' || typeof savedData.submission_id !== 'string' || typeof savedData.file_url !== 'string') {
    throw new ApiError(503, 'Submission save could not be confirmed. Please retry with the same details and file.');
  }
  return NextResponse.json({
    success: true,
    submissionId: savedData.submission_id,
    submission: savedData,
    supabaseSaved: true,
    message: 'Manuscript and linked registration saved to Supabase',
  });
}
