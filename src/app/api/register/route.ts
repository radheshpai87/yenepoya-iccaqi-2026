import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { addLocalRegistration } from '@/lib/submissionStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      institution,
      category,
      currency,
      amount,
      mode,
      paperId,
      paperTitle,
    } = body;

    if (!name || !email || !institution || !category) {
      return NextResponse.json(
        { error: 'Required fields missing' },
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
      created_at: new Date().toISOString(),
    };

    let supabaseSaved = false;
    let savedData = null;

    // Server connects to Supabase and inserts registration record
    if (isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { data, error } = await supabaseAdmin
          .from('registrations')
          .insert([regRecord])
          .select()
          .single();

        if (!error && data) {
          supabaseSaved = true;
          savedData = data;
        } else {
          console.warn('Supabase registration insert error (RLS policy or permissions):', error);
        }
      } catch (err) {
        console.error('Supabase client exception during registration insert:', err);
      }
    }

    // Always store in live memory state as well so admin panel updates without reload
    const localRecord = {
      id: savedData?.id || 'REG-' + Date.now(),
      name,
      email,
      phone: phone || '',
      institution,
      category,
      currency: currency || 'INR',
      amount: amount || '₹500',
      mode: mode || 'In-Person',
      paperId: paperId || '',
      paperTitle: paperTitle || '',
      paymentStatus: 'Pending',
      createdAt: regRecord.created_at,
    };

    addLocalRegistration(localRecord);

    return NextResponse.json({
      success: true,
      registration: savedData || localRecord,
      supabaseSaved,
      message: supabaseSaved
        ? 'Registration successfully saved in Supabase database'
        : 'Registration logged successfully in server portal',
    });
  } catch (err) {
    console.error('Server registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing registration' },
      { status: 500 }
    );
  }
}
