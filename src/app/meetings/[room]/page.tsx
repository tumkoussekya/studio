
'use client';

import React, { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import JitsiMeet from '@/components/meetings/JitsiMeet';
import { Card } from '@/components/ui/card';

function MeetingRoom() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.room as string;

  const handleLeave = () => {
    router.push('/meetings');
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="p-4 bg-card/80 backdrop-blur-sm flex justify-between items-center text-white z-10">
        <h1 className="text-xl font-bold">Meeting: {roomName.replace(/-/g, ' ')}</h1>
        <Button onClick={handleLeave} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Leave Meeting
        </Button>
      </header>
      <main className="flex-grow relative">
        <JitsiMeet roomName={roomName} onMeetingEnd={handleLeave} />
      </main>
    </div>
  );
}

// Using Suspense for client components that use params
export default function MeetingRoomPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background"><p>Loading Meeting...</p></div>}>
            <MeetingRoom />
        </Suspense>
    )
}
