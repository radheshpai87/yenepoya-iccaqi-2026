import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';

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

    // Server connects to Supabase and inserts registration record
    if (isSupabaseConfigured()) {
      const supabaseAdmin = getSupabaseAdminClient();
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .insert([regRecord])
        .select()
        .single();

      if (error) {
        console.error('Supabase registration insert error:', error);
        return NextResponse.json(
          { error: 'Failed to save registration to database' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        registration: data,
        message: 'Registration successfully logged in Supabase',
      });
    }

    // Fallback if Supabase credentials not set
    return NextResponse.json({
      success: true,
      registration: { id: 'REG-' + Date.now(), ...regRecord },
      message: 'Registration logged successfully',
    });
  } catch (err) {
    console.error('Server registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing registration' },
      { status: 500 }
    );
  }
}
