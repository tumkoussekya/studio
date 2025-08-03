
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
            onboarding_complete: false,
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

  // A trigger in Supabase now handles inserting the user into the public.users table.
  // This ensures consistency. The trigger is defined in the initial setup SQL.
  // So, the explicit insert call here is no longer needed.

  return NextResponse.json({ message: 'User created successfully. Please check your email to verify.' }, { status: 201 });
}
