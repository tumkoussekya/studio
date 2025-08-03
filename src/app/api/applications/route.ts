
'use server';

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const applicationSchema = z.object({
  job_id: z.string(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  resume_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  cover_letter: z.string().optional(),
});

export async function POST(req: NextRequest) {
    const supabase = createClient();
    
    // In a real-world scenario, you might want to protect this endpoint,
    // but for a public job application, it's typically open.
    
    const body = await req.json();
    const parseResult = applicationSchema.safeParse(body);

    if (!parseResult.success) {
        return NextResponse.json({ message: 'Invalid data', errors: parseResult.error.flatten() }, { status: 400 });
    }

    // Note: In a real app, file uploads (like resumes) would be handled separately.
    // The client would upload the file to Supabase Storage first and then send the URL
    // to this endpoint. For this demo, we'll assume resume_url is a placeholder.
    const { error } = await supabase
        .from('job_applications')
        .insert([
            { ...parseResult.data }
        ]);

    if (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ message: 'Failed to submit application', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Application submitted successfully!' });
}
