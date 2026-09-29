import { NextResponse } from 'next/server';
import { verifyAdminPassword, createSessionToken } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify password on the backend server using constant-time comparison
    const isValid = verifyAdminPassword(password);

    if (!isValid) {
      // Artificial delay to prevent brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json(
        { error: 'Invalid admin password. Access denied.' },
        { status: 401 }
      );
    }

    // Generate signed session token
    const sessionToken = createSessionToken();

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
    });

    response.cookies.set({
      name: 'admin_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal server authentication error' },
      { status: 500 }
    );
  }
}
