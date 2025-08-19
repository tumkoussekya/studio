
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Survey } from '@/lib/survey-data';
import AnswerForm from '@/components/surveys/AnswerForm';
import ResultsDisplay from '@/components/surveys/ResultsDisplay';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SurveyDetailClient({ survey }: { survey: Survey }) {

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="p-4 border-b flex justify-between items-center">
            <h1 className="text-2xl font-bold truncate pr-4">{survey.title}</h1>
            <Button asChild variant="outline">
                <Link href="/surveys">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to All Surveys
                </Link>
            </Button>
        </header>
        <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-secondary/30">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>{survey.title}</CardTitle>
                        <CardDescription>{survey.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="answer" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="answer">Answer Survey</TabsTrigger>
                                <TabsTrigger value="results">View Results</TabsTrigger>
                            </TabsList>
                            <TabsContent value="answer">
                                <AnswerForm survey={survey} />
                            </TabsContent>
                            <TabsContent value="results">
                                <ResultsDisplay survey={survey} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}
