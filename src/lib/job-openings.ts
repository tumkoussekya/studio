
import { serviceClient } from './supabase/service';

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
    const { data, error } = await serviceClient
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs:', error.message);
        return [];
    }

    return data;
}

export async function getJobById(id: string): Promise<JobOpening | null> {
    const { data, error } = await serviceClient
        .from('job_openings')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error(`Error fetching job ${id}:`, error.message);
        return null;
    }

    return data;
}
