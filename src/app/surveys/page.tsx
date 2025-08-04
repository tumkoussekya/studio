
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, BarChart2, Share2, MessageSquare, CheckSquare, FilePlus2, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAllSurveys, type Survey } from '@/lib/survey-data';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const SurveySkeleton = () => (
    <Card className="flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-1/3 mt-2" />
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
            <Skeleton className="h-48 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end gap-2 mt-4">
            <Skeleton className="h-9 w-28" />
        </CardFooter>
    </Card>
);


export default function SurveysPage() {
    const { toast } = useToast();
    const [openNewSurvey, setOpenNewSurvey] = useState(false);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSurveys = async () => {
            setIsLoading(true);
            const data = await getAllSurveys();
            setSurveys(data);
            setIsLoading(false);
        };
        fetchSurveys();
    }, []);

    const handleCreateSurvey = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement).value;

        // In a real app, you would handle form submission to your backend
        toast({
            title: "Survey Created!",
            description: `The survey "${title}" has been created as a draft.`,
        });
        setOpenNewSurvey(false);
    }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Surveys & Forms</h1>
        <Dialog open={openNewSurvey} onOpenChange={setOpenNewSurvey}>
            <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <span className='hidden sm:inline'>Create Survey</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Survey</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to start creating your survey. You can add questions in the next step.
                    </DialogDescription>
                </DialogHeader>
                <form id="new-survey-form" onSubmit={handleCreateSurvey}>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="title">Survey Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Quarterly Feedback" required />
                        </div>
                         <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" name="description" placeholder="Provide a brief description for your survey." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" form="new-survey-form">Save and Add Questions</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SurveySkeleton key={i} />)
          ) : (
            surveys.map((survey) => (
                <Card key={survey.id} className="flex flex-col hover:shadow-lg transition-shadow">
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
                <CardContent className="flex-grow flex flex-col justify-center">
                    <div className="h-48 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={survey.results} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} interval={0} />
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
                </CardContent>
                <CardFooter className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/surveys/${survey.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    </CardFooter>
                </Card>
            ))
          )}
           <Card className="flex flex-col items-center justify-center border-dashed border-2 hover:border-primary transition-colors">
              <div className="text-center p-6">
                <FilePlus2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Create from scratch</h3>
                <p className="text-sm text-muted-foreground mb-4">Design a detailed survey or a quick poll.</p>
                <Button variant="outline" onClick={() => setOpenNewSurvey(true)}>
                  <Plus className="mr-2 h-4 w-4" /> New Survey
                </Button>
              </div>
            </Card>
        </div>
      </main>
    </div>
  );
}
