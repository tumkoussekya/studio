
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { Save, CalendarIcon, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).optional().or(z.literal('')),
  job_role: z.string().optional(),
  phone_number: z.string().optional(),
  birth_date: z.date().optional(),
  pronunciation: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      job_role: '',
      phone_number: '',
      birth_date: undefined,
      pronunciation: '',
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      // In a real app, you would upload the file to storage here.
      toast({
        title: 'Avatar Updated',
        description: 'Avatar preview changed. Save your profile to apply changes.',
      });
    }
  };


  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      toast({
        title: 'Profile Updated!',
        description: 'Your profile information has been saved.',
      });
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl">User Profile</CardTitle>
          <CardDescription>
            Manage your account settings and personal details.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="md:col-span-1 flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 mb-4 border-4 border-primary">
                        <AvatarImage src={avatarPreview || `https://placehold.co/128x128.png`} data-ai-hint="avatar placeholder" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                     <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    <label htmlFor="avatar-upload" className={cn(buttonVariants({ variant: 'outline' }), 'cursor-pointer')}>
                        <Upload className="mr-2 h-4 w-4" />
                        Change Avatar
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF up to 10MB.
                    </p>
                </div>

                {/* Form Fields Section */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={isLoading} />
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
                        <Input placeholder="Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="job_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Software Engineer" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                 <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="pronunciation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name Pronunciation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jon Do" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>
            </CardContent>
            <Separator className="my-6" />
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
