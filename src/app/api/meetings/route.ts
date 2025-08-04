
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const url = new URL(req.url);
    const dateStr = url.searchParams.get('date');
    if (!dateStr) return new NextResponse('Date parameter is required', { status: 400 });

    const selectedDate = new Date(dateStr);
    const start = startOfDay(selectedDate).toISOString();
    const end = endOfDay(selectedDate).toISOString();
    
    try {
        const { data, error } = await supabase
            .from('meetings')
            .select(`
                id,
                title,
                scheduled_time,
                attendees:meeting_attendees ( user_id )
            `)
            .gte('scheduled_time', start)
            .lte('scheduled_time', end)
            .order('scheduled_time');
            
        if (error) throw error;
        
        return NextResponse.json(data);
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}


export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    try {
        const { title, scheduled_time } = await req.json();
        if (!title || !scheduled_time) {
            return new NextResponse('Title and scheduled time are required', { status: 400 });
        }

        const { data: meetingData, error } = await supabase
            .from('meetings')
            .insert({
                title,
                scheduled_time,
                organizer_id: user.id
            })
            .select()
            .single();
        
        if (error) throw error;

        // Also add the organizer as an attendee
        await supabase
            .from('meeting_attendees')
            .insert({ meeting_id: meetingData.id, user_id: user.id });

        return NextResponse.json(meetingData);
    } catch (error: any) {
         return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
