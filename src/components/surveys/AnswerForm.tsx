
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { type Survey } from '@/lib/survey-data';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface AnswerFormProps {
  survey: Survey;
}

export default function AnswerForm({ survey }: AnswerFormProps) {
  const { toast } = useToast();

  // Dynamically build Zod schema from survey questions
  const formSchema = React.useMemo(() => {
    const schemaFields: { [key: string]: z.ZodType<any, any> } = {};
    survey.questions.forEach((q) => {
      switch (q.type) {
        case 'multiple-choice':
          schemaFields[q.id] = z.string({ required_error: 'Please select an option.' });
          break;
        case 'text':
          schemaFields[q.id] = z.string().min(1, 'This field is required.');
          break;
        case 'rating':
          schemaFields[q.id] = z.array(z.number()).min(1, 'Please provide a rating.');
          break;
      }
    });
    return z.object(schemaFields);
  }, [survey]);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: survey.questions.reduce((acc, q) => {
        if (q.type === 'rating') {
            acc[q.id] = [3]; // Default rating to middle value
        } else {
            acc[q.id] = '';
        }
        return acc;
    }, {} as any)
  });

  function onSubmit(data: FormValues) {
    console.log("Survey Submission:", data);
    toast({
      title: 'Response Submitted!',
      description: 'Thank you for your valuable feedback.',
    });
    form.reset();
  }

  return (
    <Card className="border-none shadow-none">
        <CardHeader>
            <CardTitle>Submit Your Response</CardTitle>
            <CardDescription>Your answers are anonymous.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {survey.questions.map((question, index) => (
                  <FormField
                    key={question.id}
                    control={form.control}
                    name={question.id as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">{index + 1}. {question.text}</FormLabel>
                        <FormControl>
                          <>
                            {question.type === 'multiple-choice' && (
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-2 pt-2"
                              >
                                {question.options?.map((option) => (
                                  <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={option} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option}</FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            )}
                            {question.type === 'text' && <Textarea {...field} placeholder="Your thoughts..." />}
                            {question.type === 'rating' && (
                                <div className="pt-2">
                                    <Slider
                                        defaultValue={[3]}
                                        min={1}
                                        max={5}
                                        step={1}
                                        onValueChange={(value) => field.onChange(value)}
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                        <span>Strongly Disagree</span>
                                        <span>Neutral</span>
                                        <span>Strongly Agree</span>
                                    </div>
                                </div>
                            )}
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="submit">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Response
                </Button>
              </form>
            </Form>
        </CardContent>
    </Card>
  );
}

