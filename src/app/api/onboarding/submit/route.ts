
'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const onboardingSchema = z.object({
  role: z.string(),
  teamSize: z.string(),
  mainGoal: z.string(),
});

const adminRoles = ['Founder or C-Level', 'Team Lead or Manager'];

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = onboardingSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }
    
    const { role: selectedRole } = parseResult.data;
    const newRole = adminRoles.includes(selectedRole) ? 'Admin' : 'TeamMember';

    // Store the survey answers and update the user's role and onboarding status
    const { error } = await supabase
        .from('users')
        .update({
            onboarding_answers: parseResult.data,
            onboarding_complete: true,
            role: newRole,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating onboarding data:', error);
        return NextResponse.json({ message: 'Failed to save onboarding data', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Onboarding completed successfully' });
}
