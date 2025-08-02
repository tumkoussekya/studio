
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ errorMessage: 'User not authenticated.' }, { status: 401 });
    }

    const { x, y } = await req.json();
    if (typeof x !== 'number' || typeof y !== 'number') {
        return NextResponse.json({ errorMessage: 'Invalid position data.' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({ last_x: x, last_y: y })
            .eq('id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to update position:', error);
        return NextResponse.json({ errorMessage: 'Failed to update position.', message: error.message }, { status: 500 });
    }
}
