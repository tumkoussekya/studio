
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }

  // Sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            role: 'TeamMember', // Default role
            profile_complete: false, // Custom metadata
        }
    }
  });

  if (authError) {
    console.error('Supabase signup error:', authError.message);
    return NextResponse.json({ message: authError.message }, { status: authError.status || 400 });
  }

  if (!authData.user) {
    return NextResponse.json({ message: 'Signup successful, but no user data returned.' }, { status: 500 });
  }

  // Insert a corresponding row into the public.users table
  // This is now handled by a trigger in Supabase for consistency
  // but we can leave this here as a fallback or for more complex setups.
  const { error: dbError } = await supabase
    .from('users')
    .insert([
      { id: authData.user.id, email: authData.user.email, role: 'TeamMember', last_x: 200, last_y: 200, profile_complete: false },
    ]);

  if (dbError) {
    console.error('Supabase DB insert error:', dbError.message);
    // Best effort to clean up if DB insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ message: 'Could not create user profile.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'User created successfully. Please check your email to verify.' }, { status: 201 });
}
