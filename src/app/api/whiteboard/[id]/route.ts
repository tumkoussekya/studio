
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET a specific whiteboard's content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const whiteboardId = params.id;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const { data, error } = await supabase
      .from('whiteboards')
      .select('content')
      .eq('id', whiteboardId)
      .single();

    if (error) {
      // If no whiteboard exists, we can create one on the fly for this demo
      if (error.code === 'PGRST116') {
         const { data: newData, error: newError } = await supabase
            .from('whiteboards')
            .insert({ id: whiteboardId, title: 'Default Whiteboard', content: [] })
            .select('content')
            .single();
        if (newError) throw newError;
        return NextResponse.json(newData);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[WHITEBOARD ${whiteboardId} GET]`, error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


// POST to update a whiteboard's content
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const whiteboardId = params.id;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    
    const { content } = await request.json();
    if (!content) {
        return new NextResponse(JSON.stringify({ error: 'Content is required' }), { status: 400 });
    }

    const { error } = await supabase
      .from('whiteboards')
      .update({ 
          content: content, 
          updated_at: new Date().toISOString(),
          last_updated_by: user.id
       })
      .eq('id', whiteboardId);

    if (error) throw error;

    return NextResponse.json({ message: 'Whiteboard updated successfully' });

  } catch (error: any) {
    console.error(`[WHITEBOARD ${whiteboardId} POST]`, error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
