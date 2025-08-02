
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart2, Share2, MessageSquare, CheckSquare } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

const sampleSurveys = [
  {
    id: 1,
    title: 'Q3 Employee Satisfaction Survey',
    responses: 124,
    status: 'Completed',
    data: [
      { name: 'Strongly Disagree', value: 10 },
      { name: 'Disagree', value: 15 },
      { name: 'Neutral', value: 25 },
      { name: 'Agree', value: 50 },
      { name: 'Strongly Agree', value: 24 },
    ],
  },
  {
    id: 2,
    title: 'New Feature Feedback',
    responses: 78,
    status: 'In Progress',
    data: [
      { name: 'Very Difficult', value: 5 },
      { name: 'Difficult', value: 12 },
      { name: 'Neutral', value: 20 },
      { name: 'Easy', value: 30 },
      { name: 'Very Easy', value: 11 },
    ],
  },
  {
    id: 3,
    title: 'Weekly Team Lunch Poll',
    responses: 22,
    status: 'Completed',
    data: [
      { name: 'Tacos', value: 10 },
      { name: 'Pizza', value: 8 },
      { name: 'Sushi', value: 4 },
    ],
  },
];

export default function SurveysPage() {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Surveys & Forms</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Survey
        </Button>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sampleSurveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{survey.title}</CardTitle>
                    <Badge variant={survey.status === 'Completed' ? 'default' : 'secondary'}>{survey.status}</Badge>
                </div>
                <CardDescription className="flex items-center gap-2 pt-2">
                    <MessageSquare className="h-4 w-4" /> 
                    <span>{survey.responses} Responses</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <div className="h-48 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={survey.data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsla(var(--accent) / 0.2)' }}
                        contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: 'var(--radius)',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    View Results
                  </Button>
                   <Button variant="secondary" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
           <Card className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary transition-colors">
              <div className="text-center p-6">
                <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create a new poll</h3>
                <p className="text-sm text-muted-foreground mb-4">Quickly gather opinions from your team.</p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> New Poll
                </Button>
              </div>
            </Card>
        </div>
      </main>
    </div>
  );
}
