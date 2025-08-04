
// This file is now obsolete. Survey data is fetched directly from the Supabase database.
// You can safely delete this file from your project.

import { createClient } from './supabase/server';

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
    responses: number; // This will be hardcoded for now, but could be a DB call
    status: 'In Progress' | 'Completed';
    questions: Question[];
    results: { name: string; value: number }[];
}

// In a real application, questions and results would be in their own tables and joined.
// For this project, we'll keep them simplified and hardcoded here to match the survey ID.
const questionsAndResults: Record<string, Pick<Survey, 'questions' | 'results' | 'responses'>> = {
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


export async function getAllSurveys(): Promise<Survey[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('surveys').select('*');

    if (error) {
        console.error("Error fetching surveys:", error);
        return [];
    }

    return data.map(survey => ({
        ...survey,
        ...questionsAndResults[survey.id],
    }));
}

export async function getSurveyById(id: string): Promise<Survey | undefined> {
    const supabase = createClient();
    const { data, error } = await supabase.from('surveys').select('*').eq('id', id).single();
    
    if (error) {
        console.error("Error fetching survey:", error);
        return undefined;
    }

    return {
        ...data,
        ...questionsAndResults[data.id],
    };
}
