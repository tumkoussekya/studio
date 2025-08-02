
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Rss } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const sampleAnnouncements = [
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
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Rss className="size-6 text-accent" />
          <h1 className="text-2xl font-bold">Announcements</h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </header>
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto bg-secondary/30">
        <div className="max-w-4xl mx-auto space-y-6">
            {sampleAnnouncements.map((announcement, index) => (
                <Card key={announcement.id} className="shadow-md">
                    <CardHeader>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>
                            Posted by {announcement.author} &bull; {announcement.date}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
