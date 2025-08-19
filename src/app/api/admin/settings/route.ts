'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

const domainRestrictionSchema = z.object({
  domain: z.string().nullable(),
});

// Helper function to check admin role
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

// GET the current domain restriction setting
export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    await checkAdmin(cookieStore);
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'domain_restriction')
      .single();

    if (error) throw error;

    return NextResponse.json(data.value);
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

// POST to update the domain restriction setting
export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    await checkAdmin(cookieStore);
    const supabase = createClient(cookieStore);

    const body = await req.json();
    const parseResult = domainRestrictionSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('settings')
      .update({ value: parseResult.data })
      .eq('id', 'domain_restriction')
      .select();

    if (error) throw error;
    
    return NextResponse.json({ message: 'Setting updated successfully' });

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
