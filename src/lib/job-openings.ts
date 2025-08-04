
import { createClient } from './supabase/server';

export interface JobOpening {
    id: string;
    title: string;
    location: string;
    department: string;
    description: string;
    responsibilities: string[];
    qualifications: string[];
}

export async function getAllJobs(): Promise<JobOpening[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }

    return data;
}

export async function getJobById(id: string): Promise<JobOpening | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error(`Error fetching job ${id}:`, error);
        return null;
    }

    return data;
}
