
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: { user: requestingUser } } = await supabase.auth.getUser();
    if (!requestingUser) return new NextResponse('Unauthorized', { status: 401 });

    const { data: adminUserData, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', requestingUser.id)
      .single();
      
    if (adminError || !adminUserData || adminUserData.role !== 'Admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role');

    if (error) {
      throw error;
    }
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
    }));


    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}

