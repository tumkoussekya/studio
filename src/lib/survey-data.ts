
import type { PostgrestSingleResponse, SupabaseClient } from '@supabase/supabase-js';

export interface Question {
    id: string;
    text: string;
    type: 'multiple-choice' | 'text' | 'rating';
    options?: string[];
}

export interface Survey {
    id: string;
    title: string;
    description: string;
    responses: number;
    status: 'In Progress' | 'Completed';
    questions: Question[];
    results: { name: string; value: number }[];
    user_id?: string;
    created_at?: string;
}

// In a real application, questions and results would be in their own tables and joined.
// For this project, we'll keep them simplified and hardcoded here to match the survey ID for initial data.
// Newly created surveys will store their questions/results in the `surveys` table itself as JSONB.
export const questionsAndResults: Record<string, Pick<Survey, 'questions' | 'results' | 'responses'>> = {
  'q3-employee-satisfaction': {
    responses: 124,
    questions: [
        { id: 'q1', text: "Overall, how satisfied are you with your job?", type: 'multiple-choice', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied'] },
        { id: 'q2', text: "How would you rate your work-life balance?", type: 'rating' },
        { id: 'q3', text: "What could we do to improve your experience at SyncroSpace?", type: 'text' },
    ],
    results: [
      { name: 'Strongly Disagree', value: 10 },
      { name: 'Disagree', value: 15 },
      { name: 'Neutral', value: 25 },
      { name: 'Agree', value: 50 },
      { name: 'Strongly Agree', value: 24 },
    ],
  },
  'new-feature-feedback': {
    responses: 78,
    questions: [
        { id: 'f1', text: "How often have you used the AI Assistant 'Alex' in the past week?", type: 'multiple-choice', options: ['Not at all', 'Once or twice', 'Several times', 'Daily'] },
        { id: 'f2', text: "How easy was it to create a task using Alex?", type: 'rating' },
        { id: 'f3', text: "What other features would you like to see Alex have?", type: 'text' },
    ],
    results: [
      { name: 'Very Difficult', value: 5 },
      { name: 'Difficult', value: 12 },
      { name: 'Neutral', value: 20 },
      { name: 'Easy', value: 30 },
      { name: 'Very Easy', value: 11 },
    ],
  },
  'weekly-team-lunch-poll': {
    responses: 22,
    questions: [
        { id: 'l1', text: "What's your pick for this week's lunch?", type: 'multiple-choice', options: ['Tacos', 'Pizza', 'Sushi', 'Burgers', 'Salad'] },
    ],
    results: [
      { name: 'Tacos', value: 10 },
      { name: 'Pizza', value: 8 },
      { name: 'Sushi', value: 4 },
    ],
  },
};


export async function getAllSurveys(supabase: SupabaseClient): Promise<Survey[]> {
    const { data, error } = await supabase.from('surveys').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching surveys:", error);
        return [];
    }
    
    // For the initial hardcoded data, we merge the questions/results.
    // For new data from the DB, `questions` and `results` columns are used directly.
    return data.map(survey => {
        const hardcodedData = questionsAndResults[survey.id];
        return {
            ...survey,
            questions: survey.questions || hardcodedData?.questions || [],
            results: survey.results || hardcodedData?.results || [],
            responses: survey.responses ?? hardcodedData?.responses ?? 0,
        };
    });
}

export async function getSurveyById(supabase: SupabaseClient, id: string): Promise<Survey | null> {
    const { data, error }: PostgrestSingleResponse<Survey> = await supabase.from('surveys').select('*').eq('id', id).single();
    
    if (error) {
        console.error("Error fetching survey:", error);
        return null;
    }

    if (!data) return null;
    
    const hardcodedData = questionsAndResults[data.id];
    return {
        ...data,
        questions: data.questions || hardcodedData?.questions || [],
        results: data.results || hardcodedData?.results || [],
        responses: data.responses ?? hardcodedData?.responses ?? 0,
    };
}
