
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
  }
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check for domain restriction
  const { data: setting, error: settingError } = await supabase
    .from('settings')
    .select('value')
    .eq('id', 'domain_restriction')
    .single();
  
  if (setting && setting.value && (setting.value as any).domain) {
    const restrictedDomain = (setting.value as any).domain;
    if (!email.endsWith(`@${restrictedDomain}`)) {
      return NextResponse.json({ message: `Sign-up is restricted to the @${restrictedDomain} domain.` }, { status: 403 });
    }
  }


  // Sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            profile_complete: false,
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
  // The trigger sets default values for role ('TeamMember') and profile_complete (false).
  // So, no explicit insert or update call is needed here.

  return NextResponse.json({ message: 'User created successfully. Please check your email to verify.' }, { status: 201 });
}
