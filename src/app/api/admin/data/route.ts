import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/adminAuth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  getLocalRegistrations,
  getLocalSubmissions,
  updateLocalRegistrationStatus,
  updateLocalSubmissionStatus,
} from '@/lib/submissionStore';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  return verifySessionToken(sessionCookie?.value);
}

export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  const configured = isSupabaseConfigured();
  let supabaseRegistrations: any[] = [];
  let supabaseSubmissions: any[] = [];
  let supabaseConnected = false;

  // Read dynamically from process.env
  if (configured) {
    try {
      const supabaseAdmin = getSupabaseAdminClient();
      const [regResult, subResult] = await Promise.all([
        supabaseAdmin.from('registrations').select('*').order('created_at', { ascending: false }),
        supabaseAdmin.from('paper_submissions').select('*').order('created_at', { ascending: false }),
      ]);

      if (!regResult.error) {
        supabaseConnected = true;
        supabaseRegistrations = (regResult.data || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          institution: r.institution,
          category: r.category,
          currency: r.currency,
          amount: r.amount,
          mode: r.mode,
          paperId: r.paper_id,
          paymentStatus: r.payment_status || 'Pending',
          createdAt: r.created_at,
        }));
      }

      if (!subResult.error) {
        supabaseConnected = true;
        supabaseSubmissions = (subResult.data || []).map((s: any) => ({
          id: s.id,
          submissionId: s.submission_id,
          authorName: s.author_name,
          email: s.email,
          phone: s.phone,
          institution: s.institution,
          track: s.track,
          paperTitle: s.paper_title,
          abstract: s.abstract,
          fileUrl: s.file_url,
          reviewStatus: s.review_status || 'Under Review',
          createdAt: s.created_at,
        }));
      }
    } catch (err) {
      console.error('Supabase query exception, serving combined state:', err);
    }
  }

  // Deduplicate and combine local memory store with Supabase records
  const localRegs = getLocalRegistrations();
  const localSubs = getLocalSubmissions();

  const combinedRegsMap = new Map();
  // Insert local records first
  localRegs.forEach((r) => combinedRegsMap.set(r.id, r));
  // Override / append Supabase records
  supabaseRegistrations.forEach((r) => combinedRegsMap.set(r.id, r));

  const combinedSubsMap = new Map();
  localSubs.forEach((s) => combinedSubsMap.set(s.id, s));
  supabaseSubmissions.forEach((s) => combinedSubsMap.set(s.id, s));

  const combinedRegistrations = Array.from(combinedRegsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const combinedSubmissions = Array.from(combinedSubsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    supabaseConnected,
    registrations: combinedRegistrations,
    submissions: combinedSubmissions,
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, id, paymentStatus, reviewStatus } = body;

    // Update local memory state
    if (type === 'registration' && paymentStatus) {
      updateLocalRegistrationStatus(id, paymentStatus);
    } else if (type === 'submission' && reviewStatus) {
      updateLocalSubmissionStatus(id, reviewStatus);
    }

    // Also update Supabase database if configured
    if (isSupabaseConfigured()) {
      const supabaseAdmin = getSupabaseAdminClient();
      if (type === 'registration') {
        await supabaseAdmin
          .from('registrations')
          .update({ payment_status: paymentStatus })
          .eq('id', id);
      } else if (type === 'submission') {
        await supabaseAdmin
          .from('paper_submissions')
          .update({ review_status: reviewStatus })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
  }
}
