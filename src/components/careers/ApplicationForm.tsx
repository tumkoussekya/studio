
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Upload, Loader2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { createClient } from '@/lib/supabase/client';

interface ApplicationFormProps {
  jobTitle: string;
  jobId: string;
}

const applicationSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  resume_url: z.string().url('A resume is required').optional().or(z.literal('')),
  cover_letter: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationForm({ jobTitle, jobId }: ApplicationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      resume_url: '',
      cover_letter: '',
    },
  });
  
  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setResumeFile(file);
    }
  }

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsSubmitting(true);
    let resumeUrl = '';

    if (resumeFile) {
        try {
            const supabase = createClient();
            const filePath = `resumes/${jobId}-${Date.now()}-${resumeFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('databucket')
                .upload(filePath, resumeFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('databucket').getPublicUrl(filePath);
            resumeUrl = data.publicUrl;
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Resume Upload Failed', description: error.message });
            setIsSubmitting(false);
            return;
        }
    } else {
        toast({ variant: 'destructive', title: 'Resume Required', description: 'Please upload your resume to apply.' });
        setIsSubmitting(false);
        return;
    }


    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, job_id: jobId, resume_url: resumeUrl }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to submit application');
        }

        toast({
            title: 'Application Sent!',
            description: `Your application for the ${jobTitle} position has been received.`,
        });
        form.reset();
        setResumeFile(null);
        setIsDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Submission Error',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Apply for this position</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Please fill out the form below. We're excited to hear from you!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label>Resume</Label>
                <div className="mt-2 flex items-center justify-center w-full">
                    <label htmlFor="resume-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {resumeFile ? (
                                <>
                                    <FileText className="w-8 h-8 mb-4 text-primary" />
                                    <p className="mb-2 text-sm text-foreground"><span className="font-semibold">{resumeFile.name}</span></p>
                                    <p className="text-xs text-muted-foreground">Click to select a different file</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (MAX. 5MB)</p>
                                </>
                            )}
                        </div>
                        <input id="resume-upload" type="file" className="hidden" onChange={handleResumeChange} />
                    </label>
                </div>
              </div>
            <FormField
                control={form.control}
                name="cover_letter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us why you're a great fit for this role..." rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <DialogFooter className="sticky bottom-0 bg-background pt-4 -mx-1 -px-4">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Submit Application
                        </>
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
