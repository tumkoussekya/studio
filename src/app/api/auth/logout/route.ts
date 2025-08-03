
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}
