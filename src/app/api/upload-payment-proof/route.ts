import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { updateLocalRegistrationStatus } from '@/lib/submissionStore';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { sanitizeText, validateUploadedFile } from '@/lib/validation';

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
    const registrationId = sanitizeText(formData.get('registrationId') as string, 100);
    const paperId = sanitizeText(formData.get('paperId') as string, 100);
    const transactionRef = sanitizeText(formData.get('transactionRef') as string, 100);
    const file = formData.get('file') as File | null;

    if (!registrationId && !paperId) {
      return NextResponse.json(
        { error: 'Registration ID or Paper ID parameter is required' },
        { status: 400 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'Payment receipt screenshot file is required' },
        { status: 400 }
      );
    }

    // 2. Validate Screenshot File
    const fileValidation = validateUploadedFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error || 'Invalid payment receipt file format or size' },
        { status: 400 }
      );
    }

    let proofUrl = '';
    const safeRef = transactionRef || `TXN-${Date.now()}`;

    // 3. Upload Payment Receipt Screenshot to Supabase Storage
    if (isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const fileExt = file.name.split('.').pop() || 'png';
        const targetId = registrationId || paperId;
        const safeFileName = `RECEIPT_${targetId}_${Date.now()}.${fileExt}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to "manuscripts" storage bucket or "payment-receipts"
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('manuscripts')
          .upload(`receipts/${safeFileName}`, buffer, {
            contentType: file.type || 'image/png',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: signedData } = await supabaseAdmin.storage
            .from('manuscripts')
            .createSignedUrl(uploadData.path, 3600 * 24 * 365); // 1-year URL

          proofUrl = signedData?.signedUrl || '';
        } else {
          console.warn('Supabase receipt storage upload notice:', uploadError);
        }

        // 4. Update Database Record in Supabase registrations table
        if (registrationId) {
          await supabaseAdmin
            .from('registrations')
            .update({
              payment_status: 'Pending Verification',
              notes: `Payment Proof Uploaded. Ref: ${safeRef}. Image: ${proofUrl || 'Uploaded'}`,
            })
            .eq('id', registrationId);
        } else if (paperId) {
          await supabaseAdmin
            .from('registrations')
            .update({
              payment_status: 'Pending Verification',
              notes: `Payment Proof Uploaded. Ref: ${safeRef}. Image: ${proofUrl || 'Uploaded'}`,
            })
            .eq('paper_id', paperId);
        }
      } catch (err) {
        console.error('Supabase exception during payment proof upload:', err);
      }
    }

    // 5. Update Local Memory Store
    const targetId = registrationId || paperId;
    if (targetId) {
      updateLocalRegistrationStatus(targetId, 'Pending Verification');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment proof screenshot successfully uploaded and submitted for administrator verification.',
      proofUrl,
      transactionRef: safeRef,
    });
  } catch (err) {
    console.error('Upload payment proof handler error:', err);
    return NextResponse.json(
      { error: 'Failed to process payment proof screenshot' },
      { status: 500 }
    );
  }
}
