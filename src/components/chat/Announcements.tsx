
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Rss } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';

interface Announcement {
    id: number;
    title: string;
    author: string;
    date: string;
    content: string;
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: '🚀 Project Phoenix has officially launched!',
    author: 'Alice',
    date: '2 days ago',
    content: 'A big thank you to everyone involved. This was a massive team effort and we couldn\'t have done it without you. Head over to the new project board to see what\'s next.',
  },
  {
    id: 2,
    title: 'Quarterly All-Hands Meeting',
    author: 'Charlie',
    date: '4 days ago',
    content: 'Just a reminder that our Q3 All-Hands meeting is scheduled for next Tuesday at 10:00 AM in the main meeting room. Please add it to your calendars.',
  },
  {
    id: 3,
    title: 'New Coffee Machine in the Break Room ☕️',
    author: 'Bob',
    date: '1 week ago',
    content: 'Good news, everyone! The new espresso machine has arrived and is ready for use. Please be nice to it.',
  },
];


export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [openNew, setOpenNew] = useState(false);
  const { toast } = useToast();

  const handleCreateAnnouncement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;

    if (!title || !content) {
        toast({
            variant: "destructive",
            title: "Missing fields",
            description: "Please provide a title and content for the announcement."
        });
        return;
    }

    const newAnnouncement: Announcement = {
        id: Date.now(),
        title,
        content,
        author: "You", // In a real app, this would come from the current user session
        date: "Just now",
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    toast({
        title: "Announcement Posted!",
        description: "Your announcement is now live for the team to see.",
    });
    setOpenNew(false);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Rss className="size-6 text-accent" />
          <h1 className="text-2xl font-bold">Announcements</h1>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
                <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Announcement</DialogTitle>
                    <DialogDescription>
                        Share an important update with the entire team.
                    </DialogDescription>
                </DialogHeader>
                <form id="announcement-form" onSubmit={handleCreateAnnouncement}>
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g. Q4 All-Hands Meeting" />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="content">Content</Label>
                            <Textarea placeholder="Type your announcement here." id="content" name="content" rows={6} />
                        </div>
                    </div>
                </form>
                 <DialogFooter>
                    <Button type="submit" form="announcement-form">Post Announcement</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-secondary/30">
        <div className="max-w-4xl mx-auto space-y-6">
            {announcements.map((announcement) => (
                <Card key={announcement.id} className="shadow-md">
                    <CardHeader>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>
                            Posted by {announcement.author} &bull; {announcement.date}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
