
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Users, Video, Download, Loader2 } from 'lucide-react';
import { format, addHours, startOfHour } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Attendee {
    user_id: string;
    // In a real app, you'd join to get the email/name
}

interface Meeting {
  id: string;
  title: string;
  scheduled_time: string;
  attendees: Attendee[];
}

export default function MeetingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingTime, setNewMeetingTime] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const fetchMeetings = useCallback(async (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setIsLoading(true);
    try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const response = await fetch(`/api/meetings?date=${dateString}`);
        if (!response.ok) throw new Error('Failed to fetch meetings');
        const data = await response.json();
        setMeetings(data);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMeetings(date);
  }, [date, fetchMeetings]);

  const slugify = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  const handleJoinMeeting = (meeting: Meeting) => {
    const roomName = slugify(`${meeting.title}-${meeting.id.substring(0, 8)}`);
    router.push(`/meetings/${roomName}`);
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle || !newMeetingTime) {
        toast({ variant: 'destructive', title: 'Missing info', description: 'Please provide a title and time.'});
        return;
    }
    
    try {
        const response = await fetch('/api/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newMeetingTitle, scheduled_time: newMeetingTime }),
        });
        const newMeeting = await response.json();
        if (!response.ok) throw new Error(newMeeting.error || 'Failed to schedule meeting.');

        toast({ title: 'Meeting Scheduled!', description: `"${newMeetingTitle}" is on the calendar.`});
        setIsDialogOpen(false);
        setNewMeetingTitle('');
        setNewMeetingTime('');
        fetchMeetings(date); // Refresh list
    } catch (error: any) {
         toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleExportICS = (meeting: Meeting) => {
    const startTime = format(new Date(meeting.scheduled_time), "yyyyMMdd'T'HHmmss'Z'");
    const endTime = format(addHours(new Date(meeting.scheduled_time), 1), "yyyyMMdd'T'HHmmss'Z'");
    
    const icsContent = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
        `UID:${meeting.id}@syncrospace.com`,
        `DTSTAMP:${startTime}`, `DTSTART:${startTime}`, `DTEND:${endTime}`,
        `SUMMARY:${meeting.title}`, `DESCRIPTION:Meeting for ${meeting.title}`,
        'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${slugify(meeting.title)}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Meeting Exported", description: `${meeting.title} has been downloaded.` });
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <form onSubmit={handleScheduleMeeting}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" value={newMeetingTitle} onChange={e => setNewMeetingTitle(e.target.value)} placeholder="e.g. Weekly Sync" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date & Time</Label>
                    <Input id="date" value={newMeetingTime} onChange={e => setNewMeetingTime(e.target.value)} type="datetime-local" className="col-span-3" />
                  </div>
                </div>
                 <DialogFooter>
                    <Button type="submit" className="w-full">Schedule</Button>
                 </DialogFooter>
            </form>
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
            {isLoading ? (
                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : meetings.length > 0 ? meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="text-center w-16">
                        <p className="text-2xl font-bold">{format(new Date(meeting.scheduled_time), 'h')}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(meeting.scheduled_time), 'aa')}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.attendees.length} attendee(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportICS(meeting)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
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
