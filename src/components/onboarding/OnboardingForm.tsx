
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const questions = [
  {
    id: 'role',
    title: 'What is your role?',
    description: 'This will help us tailor your experience.',
    options: ['Founder or C-Level', 'Team Lead or Manager', 'Team Member', 'Student', 'Other'],
  },
  {
    id: 'teamSize',
    title: 'How large is your team?',
    description: "Let us know the size of your crew.",
    options: ['Just me', '2-10 people', '11-50 people', '51-200 people', '200+ people'],
  },
  {
    id: 'mainGoal',
    title: 'What is your main goal for using SyncroSpace?',
    description: 'What do you hope to achieve?',
    options: [
      'Improve team collaboration',
      'Better remote team culture',
      'Centralize project management',
      'Just exploring',
    ],
  },
];

const formSchema = z.object({
  role: z.string({ required_error: 'Please select a role.' }),
  teamSize: z.string({ required_error: 'Please select a team size.' }),
  mainGoal: z.string({ required_error: 'Please select a goal.' }),
});

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: '',
      teamSize: '',
      mainGoal: '',
    },
  });

  const handleNext = async () => {
    const field = questions[currentStep].id as keyof z.infer<typeof formSchema>;
    const isValid = await form.trigger(field);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/onboarding/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Something went wrong');

        toast({
            title: 'Onboarding Complete!',
            description: "Let's get your profile set up.",
        });
        router.push('/profile');
        router.refresh();
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardHeader>
                <CardTitle>{questions[currentStep].title}</CardTitle>
                <CardDescription>{questions[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name={questions[currentStep].id as keyof z.infer<typeof formSchema>}
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {questions[currentStep].options.map((option) => (
                            <FormItem
                              key={option}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {currentStep < questions.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finish
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
