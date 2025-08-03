
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  job_role: z.string().optional(),
  phone_number: z.string().optional(),
  birth_date: z.string().optional(), // Dates come as strings from JSON
  pronunciation: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }
    
    const { error } = await supabase
        .from('users')
        .update({
            ...parseResult.data,
            profile_complete: true, // Mark profile as complete
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Failed to update profile', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
}
