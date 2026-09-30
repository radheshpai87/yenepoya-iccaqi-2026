import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { addLocalSubmission, addLocalRegistration } from '@/lib/submissionStore';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText, validateUploadedFile, validateFileMagicBytes } from '@/lib/validation';
import { getIdempotentResponse, setIdempotentResponse } from '@/lib/idempotency';

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

    const formData = await request.formData();
    
    const requestId = sanitizeText(formData.get('requestId') as string, 100);
    
    // 2. Double-Click Idempotency Protection
    if (requestId) {
      const cached = getIdempotentResponse(requestId);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    const authorName = sanitizeText(formData.get('authorName') as string, 100);
    const email = sanitizeText(formData.get('email') as string, 254);
    const phone = sanitizeText(formData.get('phone') as string, 30);
    const institution = sanitizeText(formData.get('institution') as string, 200);
    const track = sanitizeText(formData.get('track') as string, 150);
    const paperTitle = sanitizeText(formData.get('paperTitle') as string, 300);
    const abstract = sanitizeText(formData.get('abstract') as string, 5000);
    const mode = sanitizeText(formData.get('mode') as string, 100);
    const file = formData.get('file') as File | null;

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

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `ICCAQI-2026-${randomNum}`;
    let fileUrl = '/sample-manuscript.pdf';
    let uploadedStoragePath: string | null = null;

    // 5. Upload manuscript file to Supabase Storage
    if (isSupabaseConfigured() && file && file.size > 0) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const fileExt = file.name.split('.').pop() || 'pdf';
        const safeFileName = `${submissionId}_${Date.now()}.${fileExt}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('manuscripts')
          .upload(safeFileName, buffer, {
            contentType: file.type || 'application/pdf',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          uploadedStoragePath = uploadData.path;
          const { data: publicUrlData } = supabaseAdmin.storage
            .from('manuscripts')
            .getPublicUrl(uploadData.path);

          if (publicUrlData) {
            fileUrl = publicUrlData.publicUrl;
          }
        } else {
          console.warn('Supabase storage upload notice:', uploadError);
        }
      } catch (uploadErr) {
        console.error('Supabase storage upload error:', uploadErr);
      }
    }

    const createdAt = new Date().toISOString();

    const submissionRecord = {
      submission_id: submissionId,
      author_name: authorName,
      email,
      phone: phone || '',
      institution,
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
      category: 'Paper Author / Research Scholar',
      currency: 'INR',
      amount: '₹750',
      mode: mode || 'Hybrid',
      paper_id: submissionId,
      paper_title: paperTitle,
      payment_status: 'Pending',
      created_at: createdAt,
    };

    let supabaseSaved = false;
    let savedData = null;

    // 6. Insert into PostgreSQL Database with Orphan Cleanup Safety
    if (isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        const { data: subData, error: subError } = await supabaseAdmin
          .from('paper_submissions')
          .insert([submissionRecord])
          .select()
          .single();

        if (!subError && subData) {
          supabaseSaved = true;
          savedData = subData;

          // Insert into registrations table as well
          await supabaseAdmin
            .from('registrations')
            .insert([regRecord]);
        } else {
          console.warn('Supabase paper_submissions insert notice:', subError);
          // Clean up orphaned storage object if database insert failed
          if (uploadedStoragePath) {
            await supabaseAdmin.storage.from('manuscripts').remove([uploadedStoragePath]);
            console.info('Orphaned storage object cleaned up:', uploadedStoragePath);
          }
        }
      } catch (err) {
        console.error('Supabase client exception during paper insert:', err);
        // Clean up orphaned storage object on exception
        if (uploadedStoragePath) {
          try {
            const supabaseAdmin = getSupabaseAdminClient();
            await supabaseAdmin.storage.from('manuscripts').remove([uploadedStoragePath]);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }

    const localRecord = {
      id: savedData?.id || 'SUB-' + Date.now(),
      submissionId,
      authorName,
      email,
      phone: phone || '',
      institution,
      track,
      paperTitle,
      abstract,
      fileUrl,
      reviewStatus: 'Submitted',
      createdAt,
    };

    const localRegRecord = {
      id: 'REG-' + Date.now(),
      name: authorName,
      email,
      phone: phone || '',
      institution,
      category: 'Paper Author / Research Scholar',
      currency: 'INR',
      amount: '₹750',
      mode: mode || 'Hybrid',
      paperId: submissionId,
      paperTitle,
      paymentStatus: 'Pending',
      createdAt,
    };

    addLocalSubmission(localRecord);
    addLocalRegistration(localRegRecord);

    const responsePayload = {
      success: true,
      submissionId: savedData?.submission_id || submissionId,
      submission: savedData || localRecord,
      supabaseSaved,
      message: supabaseSaved
        ? 'Manuscript submitted successfully and saved to Supabase'
        : 'Manuscript submission logged in server portal',
    };

    // Cache idempotent response if requestId present
    if (requestId) {
      setIdempotentResponse(requestId, responsePayload);
    }

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error('Server paper submission error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing manuscript submission' },
      { status: 500 }
    );
  }
}
