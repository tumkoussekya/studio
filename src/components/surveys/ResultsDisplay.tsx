
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import type { Survey } from '@/lib/survey-data';

interface ResultsDisplayProps {
  survey: Survey;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#FFBB28', '#FF8042', '#00C49F'];

export default function ResultsDisplay({ survey }: ResultsDisplayProps) {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Survey Results</CardTitle>
        <CardDescription>
          A summary of the {survey.responses} responses received so far.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {survey.questions.map((question, index) => (
          <div key={question.id}>
            <h3 className="font-semibold text-lg mb-2">{index + 1}. {question.text}</h3>
            {question.type === 'multiple-choice' || question.type === 'rating' ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={survey.results} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                    <Tooltip
                        cursor={{ fill: 'hsla(var(--accent) / 0.2)' }}
                        contentStyle={{ 
                            background: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: 'var(--radius)',
                        }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                       {survey.results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Card className="bg-muted/50 max-h-48 overflow-y-auto">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground italic">Showing a sample of text responses:</p>
                  <blockquote className="border-l-2 pl-4 text-sm">"The new onboarding process is much smoother."</blockquote>
                  <blockquote className="border-l-2 pl-4 text-sm">"More opportunities for cross-team collaboration would be great."</blockquote>
                  <blockquote className="border-l-2 pl-4 text-sm">"I appreciate the flexibility, but sometimes miss the office chatter."</blockquote>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
