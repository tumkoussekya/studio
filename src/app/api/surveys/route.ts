
'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createSurveySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

const defaultQuestions = [
    { id: 'q1', text: "Overall, how satisfied are you with this?", type: 'rating' },
    { id: 'q2', text: "What could be improved?", type: 'text' },
];

const defaultResults = [
    { name: '1 Star', value: 0 },
    { name: '2 Stars', value: 0 },
    { name: '3 Stars', value: 0 },
    { name: '4 Stars', value: 0 },
    { name: '5 Stars', value: 0 },
];


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

    const newSurveyData = {
      title: parseResult.data.title,
      description: parseResult.data.description || '',
      status: 'In Progress' as const,
      user_id: user.id,
      // Storing questions/results as JSONB
      questions: defaultQuestions, 
      results: defaultResults,
      responses: 0,
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
    
    return NextResponse.json(data, { status: 201 });

  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
