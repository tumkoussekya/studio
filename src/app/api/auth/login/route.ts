
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sign } from 'jsonwebtoken';
import { setCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  // Authenticate with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ message: authError?.message || 'Invalid credentials' }, { status: 401 });
  }

  // Fetch user profile from public.users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !userProfile) {
     return NextResponse.json({ message: 'Could not find user profile.' }, { status: 500 });
  }

  // Create a custom JWT for our app's session management
  const token = sign(
    { 
        userId: userProfile.id, 
        email: userProfile.email, 
        lastX: userProfile.last_x, 
        lastY: userProfile.last_y, 
        role: userProfile.role 
    }, 
    JWT_SECRET, 
    {
      expiresIn: '1h',
    }
  );
  
  const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

  setCookie('token', token, {
    req,
    res: response,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return response;
}
