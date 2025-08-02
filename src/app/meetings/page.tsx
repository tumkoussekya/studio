
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Users, Video, Download } from 'lucide-react';
import { format, addHours, startOfHour } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

interface Meeting {
  id: number;
  title: string;
  time: Date;
  attendees: string[];
}

const sampleMeetings: Meeting[] = [
  { id: 1, title: "Project Phoenix Standup", time: addHours(startOfHour(new Date()), 1), attendees: ["Alice", "Bob", "Charlie"] },
  { id: 2, title: "Q3 Marketing Sync", time: addHours(startOfHour(new Date()), 3), attendees: ["David", "Eve"] },
  { id: 3, title: "Design Review", time: addHours(startOfHour(new Date()), 5), attendees: ["Bob", "Frank", "Grace"] },
];

export default function MeetingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const router = useRouter();

  const slugify = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  const handleJoinMeeting = (meeting: Meeting) => {
    const roomName = slugify(meeting.title);
    router.push(`/meetings/${roomName}`);
  };

  const handleExportICS = (meeting: Meeting) => {
    const startTime = format(meeting.time, "yyyyMMdd'T'HHmmss'Z'");
    const endTime = format(addHours(meeting.time, 1), "yyyyMMdd'T'HHmmss'Z'");
    const eventName = meeting.title;
    const eventDescription = `Join the meeting for ${meeting.title}. Attendees: ${meeting.attendees.join(', ')}`;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `UID:${meeting.id}@syncrospace.com`,
        `DTSTAMP:${startTime}`,
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${eventName}`,
        `DESCRIPTION:${eventDescription}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${meeting.title.replace(/ /g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
        title: "Meeting Exported",
        description: `${meeting.title} has been downloaded as an ICS file.`
    })
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule a Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Meeting</DialogTitle>
              <DialogDescription>
                Fill in the details below to schedule a new meeting.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input id="title" placeholder="e.g. Weekly Sync" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date & Time</Label>
                <Input id="date" type="datetime-local" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attendees" className="text-right">Attendees</Label>
                <Input id="attendees" placeholder="e.g. user@example.com" className="col-span-3" />
              </div>
            </div>
             <Button type="submit" className="w-full">Schedule</Button>
          </DialogContent>
        </Dialog>
      </header>
      <main className="flex-grow flex flex-col md:flex-row p-4 md:p-6 lg:p-8 gap-8">
        <aside className="w-full md:w-80 lg:w-96">
          <Card>
            <CardHeader>
                <CardTitle>Select a Date</CardTitle>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0 rounded-md"
                />
            </CardContent>
          </Card>
        </aside>
        <section className="flex-1">
          <h2 className="text-2xl font-bold mb-4">
            Meetings for {date ? format(date, 'PPP') : '...'}
          </h2>
          <div className="space-y-4">
            {sampleMeetings.length > 0 ? sampleMeetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="text-center w-16">
                        <p className="text-2xl font-bold">{format(meeting.time, 'h')}</p>
                        <p className="text-sm text-muted-foreground">{format(meeting.time, 'aa')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.attendees.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportICS(meeting)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export ICS
                    </Button>
                    <Button size="sm" onClick={() => handleJoinMeeting(meeting)}>
                      <Video className="mr-2 h-4 w-4" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card className="flex items-center justify-center h-48 border-dashed">
                <p className="text-muted-foreground">No meetings scheduled for this day.</p>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
