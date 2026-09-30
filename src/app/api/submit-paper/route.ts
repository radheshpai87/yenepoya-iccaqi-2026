import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { addLocalSubmission, addLocalRegistration } from '@/lib/submissionStore';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { isValidEmail, sanitizeText, validateUploadedFile } from '@/lib/validation';

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

    // 2. Strict File Upload Security Validation (MIME & Size check)
    if (file) {
      const fileValidation = validateUploadedFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { error: fileValidation.error || 'Invalid file document upload' },
          { status: 400 }
        );
      }
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `ICCAQI-2026-${randomNum}`;
    let fileUrl = '/sample-manuscript.pdf';

    // 3. Upload manuscript PDF file to Supabase Storage Bucket 'manuscripts' using safe generated key
    if (isSupabaseConfigured() && file && file.size > 0) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const fileExt = file.name.split('.').pop() || 'pdf';
        // Generate safe non-arbitrary filename key
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

    // Insert manuscript submission AND delegate registration into Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        
        // 1. Insert into paper_submissions
        const { data: subData, error: subError } = await supabaseAdmin
          .from('paper_submissions')
          .insert([submissionRecord])
          .select()
          .single();

        if (!subError && subData) {
          supabaseSaved = true;
          savedData = subData;
        } else {
          console.warn('Supabase paper_submissions insert notice:', subError);
        }

        // 2. Insert into registrations table so author appears under Delegate Registrations as well
        const { error: regError } = await supabaseAdmin
          .from('registrations')
          .insert([regRecord]);

        if (regError) {
          console.warn('Supabase registrations author insert notice:', regError);
        }
      } catch (err) {
        console.error('Supabase client exception during paper insert:', err);
      }
    }

    // Always store in live memory state so admin panel updates instantly without page reload
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

    return NextResponse.json({
      success: true,
      submissionId: savedData?.submission_id || submissionId,
      submission: savedData || localRecord,
      supabaseSaved,
      message: supabaseSaved
        ? 'Manuscript submitted successfully and saved to Supabase'
        : 'Manuscript submission logged in server portal',
    });
  } catch (err) {
    console.error('Server paper submission error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing manuscript submission' },
      { status: 500 }
    );
  }
}
