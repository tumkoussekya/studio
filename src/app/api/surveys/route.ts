
'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { questionsAndResults } from '@/lib/survey-data';

const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parseResult = createSurveySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }

    // For this demo, we'll assign a hardcoded ID and status.
    // In a real app, the ID would be auto-generated.
    const newSurveyData = {
      id: `new-survey-${Date.now()}`,
      title: parseResult.data.title,
      description: parseResult.data.description || '',
      status: 'In Progress' as const,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('surveys')
      .insert(newSurveyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating survey:', error);
      throw error;
    }
    
    // In a real app, you would have logic to assign default questions or an editor.
    // For this demo, we return an empty shell.
    const fullSurveyResponse = {
        ...data,
        questions: [],
        results: [],
        responses: 0,
    };

    return NextResponse.json(fullSurveyResponse, { status: 201 });

  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
