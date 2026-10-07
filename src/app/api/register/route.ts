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

    const body = await request.json();
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
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert([regRecord])
      .select()
      .single();
    if (error || !data) {
      throw new Error('Registration database save failed', { cause: error });
    }

    return NextResponse.json({
      success: true,
      registration: data,
      supabaseSaved: true,
      message: 'Registration successfully saved in Supabase database',
    });
  } catch (err) {
    console.error('Server registration error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing registration' },
      { status: 500 }
    );
  }
}
