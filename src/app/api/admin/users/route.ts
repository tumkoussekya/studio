
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  // Note: The middleware should have already handled authentication
  // and role-based access control for this endpoint.
  const supabase = createClient();
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, last_x, last_y');

    if (error) {
      throw error;
    }
    
    // The user object from the database has last_x and last_y, which matches the required format.
    // We just need to rename the fields for the frontend if necessary, but the current model is fine.
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      lastX: user.last_x,
      lastY: user.last_y,
    }));


    return NextResponse.json(formattedUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
