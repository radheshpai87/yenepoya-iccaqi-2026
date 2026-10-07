import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
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
      throw new Error('Supabase is not configured');
    }
    const supabaseAdmin = getSupabaseAdminClient();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `ICCAQI-2026-${randomNum}`;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const storagePath = `${submissionId}_${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('manuscripts')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      });
    if (uploadError || !uploadData) {
      throw new Error('Manuscript storage save failed', { cause: uploadError });
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

    const { data: savedData, error: submissionError } = await supabaseAdmin
      .from('paper_submissions')
      .insert([submissionRecord])
      .select()
      .single();
    if (submissionError || !savedData) {
      // A network failure may follow a committed insert. Preserve the manuscript
      // rather than deleting a file that a durable record could reference.
      throw new Error('Submission database save failed', { cause: submissionError });
    }
    const { error: registrationError } = await supabaseAdmin
      .from('registrations')
      .insert([regRecord]);
    if (registrationError) {
      throw new Error('Linked registration save failed', { cause: registrationError });
    }

    const responsePayload = {
      success: true,
      submissionId: savedData.submission_id,
      submission: savedData,
      supabaseSaved: true,
      message: 'Manuscript and linked registration saved to Supabase',
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
