
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  // Authenticate with Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ message: error.message || 'Invalid credentials' }, { status: 401 });
  }

  // The cookie is automatically set by the Supabase client helper
  return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}
