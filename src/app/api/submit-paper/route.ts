import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const authorName = formData.get('authorName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const institution = formData.get('institution') as string;
    const track = formData.get('track') as string;
    const paperTitle = formData.get('paperTitle') as string;
    const abstract = formData.get('abstract') as string;
    const mode = formData.get('mode') as string;
    const file = formData.get('file') as File | null;

    if (!authorName || !email || !paperTitle || !abstract || !track) {
      return NextResponse.json(
        { error: 'Required manuscript submission fields missing' },
        { status: 400 }
      );
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `ICCAQI-2026-${randomNum}`;
    let fileUrl = '/sample-manuscript.pdf';

    // Upload manuscript PDF file to Supabase Storage Bucket 'manuscripts' if configured
    if (isSupabaseConfigured() && file && file.size > 0) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const fileExt = file.name.split('.').pop() || 'pdf';
        const fileName = `${submissionId}_${Date.now()}.${fileExt}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('manuscripts')
          .upload(fileName, buffer, {
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
        }
      } catch (uploadErr) {
        console.error('Supabase storage upload error:', uploadErr);
      }
    }

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
      created_at: new Date().toISOString(),
    };

    // Insert manuscript submission metadata into Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      const supabaseAdmin = getSupabaseAdminClient();
      const { data, error } = await supabaseAdmin
        .from('paper_submissions')
        .insert([submissionRecord])
        .select()
        .single();

      if (error) {
        console.error('Supabase paper_submissions insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save paper submission to database' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        submissionId: data.submission_id || submissionId,
        submission: data,
        message: 'Manuscript submitted successfully and saved to Supabase',
      });
    }

    // Fallback if Supabase credentials not configured
    return NextResponse.json({
      success: true,
      submissionId,
      message: 'Manuscript submission acknowledged',
    });
  } catch (err) {
    console.error('Server paper submission error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing manuscript submission' },
      { status: 500 }
    );
  }
}
