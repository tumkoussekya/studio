
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
    results: { name: string; value: number }[]; // Simplified for dashboard chart
}


export const sampleSurveys: Survey[] = [
  {
    id: 'q3-employee-satisfaction',
    title: 'Q3 Employee Satisfaction Survey',
    description: "Your feedback is crucial for us to improve our work environment. Please take a few moments to answer these questions honestly.",
    responses: 124,
    status: 'Completed',
    questions: [
        { id: 'q1', text: "Overall, how satisfied are you with your job?", type: 'multiple-choice', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied', 'Very Unsatisfied'] },
        { id: 'q2', text: "How would you rate your work-life balance?", type: 'rating' },
        { id: 'q3', text: "What could we do to improve your experience at SyncroSpace?", type: 'text' },
    ],
    results: [ // This simplified data is for the main dashboard chart
      { name: 'Strongly Disagree', value: 10 },
      { name: 'Disagree', value: 15 },
      { name: 'Neutral', value: 25 },
      { name: 'Agree', value: 50 },
      { name: 'Strongly Agree', value: 24 },
    ],
  },
  {
    id: 'new-feature-feedback',
    title: 'New Feature Feedback: AI Assistant "Alex"',
    description: "We've recently introduced our new AI Assistant, Alex. We'd love to hear your thoughts on its usefulness and performance.",
    responses: 78,
    status: 'In Progress',
    questions: [
        { id: 'f1', text: "How often have you used the AI Assistant 'Alex' in the past week?", type: 'multiple-choice', options: ['Not at all', 'Once or twice', 'Several times', 'Daily'] },
        { id: 'f2', text: "How easy was it to create a task using Alex?", type: 'rating' },
        { id: 'f3', text: "What other features would you like to see Alex have?", type: 'text' },
    ],
    results: [ // This simplified data is for the main dashboard chart
      { name: 'Very Difficult', value: 5 },
      { name: 'Difficult', value: 12 },
      { name: 'Neutral', value: 20 },
      { name: 'Easy', value: 30 },
      { name: 'Very Easy', value: 11 },
    ],
  },
  {
    id: 'weekly-team-lunch-poll',
    title: 'Weekly Team Lunch Poll',
    description: "Time to decide on this week's team lunch! Cast your vote for your preferred cuisine.",
    responses: 22,
    status: 'Completed',
    questions: [
        { id: 'l1', text: "What's your pick for this week's lunch?", type: 'multiple-choice', options: ['Tacos', 'Pizza', 'Sushi', 'Burgers', 'Salad'] },
    ],
    results: [ // This simplified data is for the main dashboard chart
      { name: 'Tacos', value: 10 },
      { name: 'Pizza', value: 8 },
      { name: 'Sushi', value: 4 },
    ],
  },
];


export function getSurveyById(id: string): Survey | undefined {
    return sampleSurveys.find(survey => survey.id === id);
}
