
import { createClient } from '@/lib/supabase/server';
import { type UserRole } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const roleUpdateSchema = z.object({
  role: z.enum(['Admin', 'TeamMember']),
});


async function checkAdmin(supabase: ReturnType<typeof createClient>) {
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

// Update a user's role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const targetUserId = params.id;

  try {
    await checkAdmin(supabase);

    const body = await request.json();
    const parseResult = roleUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: 'Invalid role data', errors: parseResult.error.flatten() }, { status: 400 });
    }

    const { role } = parseResult.data;

    // Update the role in the custom `users` table
    const { error: dbError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', targetUserId);

    if (dbError) throw dbError;

    // Supabase Auth doesn't have roles in its JWT by default,
    // but you can update app_metadata if you have that configured.
    // For now, updating our own table is sufficient.

    return NextResponse.json({ message: 'User role updated successfully' });
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


// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const targetUserId = params.id;

  try {
    await checkAdmin(supabase);

    // Using the service role key to delete users is best practice for production
    // But for this demo, the admin user can delete others.
    const { error: authError } = await supabase.auth.admin.deleteUser(targetUserId);
    
    if (authError) throw authError;

    // The user will be deleted from the `users` table via the `ON DELETE CASCADE` trigger.
    
    return NextResponse.json({ message: 'User deleted successfully' });
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
