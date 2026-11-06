import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const limit = checkRateLimit(getClientIP(request));
  if (!limit.success) return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Registration lookup is temporarily unavailable.' }, { status: 503 });

  const rawId = (new URL(request.url).searchParams.get('id') || '').trim();
  if (!rawId || rawId.length > 100 || !/^[a-z0-9_-]+$/i.test(rawId)) {
    return NextResponse.json({ error: 'A valid registration reference is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const isUuid = UUID_PATTERN.test(rawId);
  const cleanId = rawId.replace(/^ICCAQI-?/i, '').trim();

  let regRecord: any = null;
  let subRecord: any = null;

  try {
    // 1. Check registrations table
    if (isUuid) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', rawId)
        .limit(1);
      if (data && data[0]) regRecord = data[0];
    }

    if (!regRecord) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('paper_id', cleanId)
        .limit(1);
      if (data && data[0]) regRecord = data[0];
    }

    if (!regRecord && !isUuid) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('paper_id', rawId)
        .limit(1);
      if (data && data[0]) regRecord = data[0];
    }

    // 2. Check paper_submissions table
    if (isUuid) {
      const { data } = await supabase
        .from('paper_submissions')
        .select('*')
        .eq('id', rawId)
        .limit(1);
      if (data && data[0]) subRecord = data[0];
    }

    if (!subRecord) {
      const { data } = await supabase
        .from('paper_submissions')
        .select('*')
        .eq('submission_id', cleanId)
        .limit(1);
      if (data && data[0]) subRecord = data[0];
    }

    // 3. If subRecord found, attempt to link with registrations if regRecord wasn't found yet
    if (subRecord && !regRecord && subRecord.submission_id) {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('paper_id', subRecord.submission_id)
        .limit(1);
      if (data && data[0]) regRecord = data[0];
    }

    if (!regRecord && !subRecord) {
      return NextResponse.json({ error: 'Registration was not found.' }, { status: 404 });
    }

    // Normalize category and calculate fee if missing
    const category = regRecord?.category || subRecord?.author_category || 'Research Scholars / Academicians';
    let amount = regRecord?.amount || '';
    if (!amount) {
      const catLower = category.toLowerCase();
      if (catLower.includes('student') || catLower.includes('ug') || catLower.includes('pg')) {
        amount = '₹500';
      } else if (catLower.includes('industry')) {
        amount = '₹1,500';
      } else if (catLower.includes('attendee') || catLower.includes('observer') || catLower.includes('participant')) {
        amount = '₹300';
      } else {
        amount = '₹750';
      }
    }

    const rawMode = regRecord?.mode || subRecord?.participation_mode || subRecord?.mode || 'Offline';
    const cleanMode = rawMode.includes(' | ') ? rawMode.split(' | ')[0] : rawMode;

    return NextResponse.json({
      registration: {
        id: regRecord?.id || subRecord?.id || rawId,
        name: regRecord?.name || subRecord?.author_name || '',
        email: regRecord?.email || subRecord?.email || '',
        phone: regRecord?.phone || subRecord?.phone || '',
        institution: regRecord?.institution || subRecord?.institution || '',
        country: regRecord?.country || '',
        category: category,
        paperId: regRecord?.paper_id || subRecord?.submission_id || cleanId,
        paperTitle: regRecord?.paper_title || subRecord?.paper_title || '',
        mode: cleanMode || 'Offline',
        currency: regRecord?.currency || 'INR',
        amount: amount,
        paymentStatus: regRecord?.payment_status || 'Pending',
      }
    });
  } catch (error) {
    console.error('Payment registration lookup failed:', error);
    return NextResponse.json({ error: 'Registration details could not be loaded.' }, { status: 503 });
  }
}
