
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  // Get the redirect URL from the request headers
  // Supabase sends a magic link, and it needs to know where to redirect the user back to
  // after they've set their new password.
  const redirectTo = new URL('/login', req.nextUrl.origin).toString();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error('Password Reset Error:', error);
    // Even if there's an error (like user not found), we don't want to reveal that.
    // So we return a generic success message to prevent user enumeration attacks.
  }

  return NextResponse.json({
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}
