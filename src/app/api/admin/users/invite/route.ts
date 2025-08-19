import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});

async function checkAdmin(cookieStore: ReturnType<typeof cookies>) {
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !userData) {
    throw new Error('Could not retrieve user role');
  }

  if (userData.role !== 'Admin') {
    throw new Error('Forbidden: Insufficient privileges');
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    await checkAdmin(cookieStore);
    
    // We need to create a new client with the service role for inviting users
    const supabaseAdmin = createClient(cookieStore);

    const body = await req.json();
    const parseResult = inviteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }

    const { email } = parseResult.data;

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({ message: `Invitation sent successfully to ${email}` });

  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
    }
     if (error.message.includes('Not authenticated')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
