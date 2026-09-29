import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/adminAuth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    const isValid = verifySessionToken(sessionCookie?.value);

    if (!isValid) {
      return NextResponse.json(
        { authenticated: false, error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: { role: 'Administrator', title: 'Yenepoya ICCAQI 2026 Admin' },
    });
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
