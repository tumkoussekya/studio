
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// Schema for validating new channel creation
const createChannelSchema = z.object({
  name: z.string().min(1, 'Channel name is required').max(50, 'Channel name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
});

// GET all chat channels
export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST a new chat channel
export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const parseResult = createChannelSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }
    
    const { name, description } = parseResult.data;

    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name,
        description,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);

  } catch (error: any) {
    // Handle potential duplicate channel names if you have a unique constraint
    if (error.code === '23505') {
        return new NextResponse(JSON.stringify({ error: "A channel with this name already exists." }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
