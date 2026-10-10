import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const limit = checkRateLimit(getClientIP(request));
  if (!limit.success) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Registration lookup is temporarily unavailable.' }, { status: 503 });

  const id = (new URL(request.url).searchParams.get('id') || '').trim();
  if (!id || id.length > 100 || !/^[a-z0-9_-]+$/i.test(id)) return NextResponse.json({ error: 'A valid registration reference is required.' }, { status: 400 });
  const supabase = getSupabaseAdminClient();
  let { data, error } = UUID_PATTERN.test(id)
    ? await supabase.from('registrations').select('id, name, email, phone, institution, category, paper_id, paper_title, mode, currency, amount, payment_status').eq('id', id).maybeSingle()
    : await supabase.from('registrations').select('id, name, email, phone, institution, category, paper_id, paper_title, mode, currency, amount, payment_status').eq('paper_id', id).maybeSingle();

  if (!error && !data && !UUID_PATTERN.test(id)) {
    const submission = await supabase.from('paper_submissions')
      .select('id, submission_id, author_name, email, phone, institution, author_category, paper_title, participation_mode')
      .eq('submission_id', id)
      .maybeSingle();
    if (submission.error) error = submission.error;
    else if (submission.data) {
      const s = submission.data;
      data = {
        id: s.id,
        name: s.author_name,
        email: s.email,
        phone: s.phone,
        institution: s.institution,
        category: s.author_category || 'Research scholars / Academicians',
        paper_id: s.submission_id,
        paper_title: s.paper_title,
        mode: s.participation_mode || 'Offline',
        currency: 'INR',
        amount: '',
        payment_status: 'Pending',
      };
    }
  }

  if (error) {
    console.error('Payment registration lookup failed:', error);
    return NextResponse.json({ error: 'Registration details could not be loaded.' }, { status: 503 });
  }
  if (!data) return NextResponse.json({ error: 'Registration was not found.' }, { status: 404 });

  return NextResponse.json({ registration: {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    institution: data.institution || '',
    category: data.category || '',
    paperId: data.paper_id || '',
    paperTitle: data.paper_title || '',
    mode: data.mode || 'Offline',
    currency: data.currency || 'INR',
    amount: data.amount || '',
    paymentStatus: data.payment_status || 'Pending',
  } });
}
